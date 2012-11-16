//dependencies
var fs = require('fs'); 
var pathLib = require('path');

var MediaFolder = require('../mediaFolder');
var MediaFile = require('../mediaFile');
//UnitTest object
var UnitTest = require('./unitTest');

//load test config
var testConfig = JSON.parse(fs.readFileSync('./testConfig.json'));

var comedyFolder = new MediaFolder({path:testConfig.baseTestMediaFolder + '/My Movie Archive/Comedy', type:'movies'});

var ScraperClass = require('../Scrapers/imdbScraper')

//Object Definition
var MediaScraperTest = module.exports = new UnitTest(function(){
	
	//test scraping on IMDB
	this.testIMDBSearch_ExactMatch = function(test){
		//set the a higher timeout since this will connect to the internet to the imdb website
		test.newTimeOut(2 * 1000);//5 seconds

		var fileName = 'Surfer Dude DVDRip.avi';
		var mediaFile = new MediaFile(fileName, comedyFolder);

		//scrape
		new ScraperClass(mediaFile).search()
			.done(function(info){
				//media info
				test.assertNotNull(info, 'info shoult not be null');

				test.assertEqual(info.imdb.id, "tt0976247", 'imdb id');

				test.assertEqual(info.imdb.title, "Surfer, Dude", 'imdb title');

				test.end();
			})
			.fail(function(){
				test.fail('should work');
			});
	};

	this.testIMDBSearch_titlePopular = function(test){
		//set the a higher timeout since this will connect to the internet to the imdb website
		test.newTimeOut(2 * 1000);//5 seconds

		var fileName = 'The Expendables 2.mkv';
		var mediaFile = new MediaFile(fileName, comedyFolder);

		//scrape
		new ScraperClass(mediaFile).search()
			.done(function(info){
				//media info
				test.assertNotNull(info, 'info shoult not be null');
				test.assertEqual(info.imdb.id, "tt1764651", 'imdb id');
				test.assertEqual(info.imdb.title, "The Expendables 2", 'imdb title');

				//check candidates
				test.assertNotNull(info.candidates, 'candidates shoult not be null');
				test.assertEqual(info.candidates.length, 1, 'one candidate');
				test.assertEqual(info.candidates[0].imdb.id, "tt1320253", 'imdb id');
				test.assertEqual(info.candidates[0].imdb.title, "The Expendables", 'imdb title');

				test.end();
			})
			.fail(function(){
				test.fail('should work');
			});
	};


});

MediaScraperTest.setup(module);