//dependencies
var fs = require('fs'); 
var pathLib = require('path');

var MediaScraper = require('../mediaScraper');
var MediaFolder = require('../mediaFolder');
var MediaFile = require('../mediaFile');
//UnitTest object
var UnitTest = require('./unitTest');

//load test config
var testConfig = JSON.parse(fs.readFileSync('./testConfig.json'));

var comedyFolder = MediaFolder.get({path:pathLib.join(testConfig.baseTestMediaFolder, 'My Movie Archive', 'Comedy'), type:'movies'});

//Object Definition
var MediaScraperTest = module.exports = new UnitTest(function(){
	
	//test scraping on IMDB
	this.testIMDBSearch_ExactMatch = function(test){
		//set the a higher timeout since this will connect to the internet to the imdb website
		test.newTimeOut(2 * 1000);//5 seconds

		var fileName = 'Surfer Dude DVDRip.avi';
		var mediaFile = new MediaFile(fileName, comedyFolder);

		var mediaScraper = new MediaScraper(mediaFile);

		mediaScraper.scrape()
			.done(function(info){
				//media info
				test.assertNotNull(info, 'info shoult not be null');

				test.assertEqual(info.imdb.imdb_id, "tt0976247", 'imdb id');

				test.assertEqual(info.imdb.title, "Surfer, Dude", 'imdb title');

				test.end();
			})
			.fail(function(){
				test.fail('should work');
			});
	};

	this.testIMDBSearch_titlePopular = function(test){
		//set the a higher timeout since this will connect to the internet to the imdb website
		test.newTimeOut(2 * 1000);//2 seconds

		var fileName = 'The Expendables.mkv';
		var mediaFile = new MediaFile(fileName, comedyFolder);

		var mediaScraper = new MediaScraper(mediaFile);

		mediaScraper.scrape()
			.done(function(info){
				//media info
				test.assertNotNull(info, 'info shoult not be null');
				test.assertEqual(info.imdb.imdb_id, "tt1320253", 'imdb id');
				test.assertEqual(info.imdb.title, "The Expendables", 'imdb title');

				//check candidates
				test.assertNotNull(info.candidates, 'candidates shoult not be null');
				test.assertEqual(info.candidates.length, 1, 'one candidate');
				test.assertEqual(info.candidates[0].imdb.imdb_id, "tt1764651", 'imdb id');
				test.assertEqual(info.candidates[0].imdb.title, "The Expendables 2", 'imdb title');

				test.end();
			})
			.fail(function(){
				test.fail('should work');
			});
	};


});

MediaScraperTest.setup(module);