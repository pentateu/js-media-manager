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

var imdbOrgScraper = require('../Scrapers/imdbOrgScraper')

//Object Definition
var ImdbOrgScraperTest = module.exports = new UnitTest(function(){
	
	//test scraping on IMDB
	this.testIMDBSearch_ExactMatch = function(test){
		//set the a higher timeout since this will connect to the internet to the imdb website
		test.newTimeOut(2 * 1000);//5 seconds

		var fileName = 'Surfer Dude DVDRip.avi';
		var mediaFile = new MediaFile(fileName, comedyFolder);

		//scrape
		imdbOrgScraper.mediaFile = mediaFile;
		imdbOrgScraper.search()
			.done(function(info){
				//media info
				test.assertNotNull(info, 'info shoult not be null');

				test.assertEqual(info.imdb.imdb_id, "tt0976247", 'imdb id');

				test.assertEqual(info.imdb.title, "Surfer, Dude", 'imdb title');

				test.end();
			})
			.fail(function(err){
				test.fail('should work : ' + JSON.stringify(err));
			});
	};

	this.testIMDBSearch_2Matches = function(test){
		//set the a higher timeout since this will connect to the internet to the imdb website
		test.newTimeOut(2 * 1000);//5 seconds

		var fileName = 'The Expendables 2.mkv';
		var mediaFile = new MediaFile(fileName, comedyFolder);

		//scrape
		imdbOrgScraper.mediaFile = mediaFile;
		imdbOrgScraper.search()
			.done(function(info){
				//media info
				test.assertNotNull(info, 'info shoult not be null');
				test.assertEqual(info.imdb.imdb_id, "tt1764651", 'imdb id');
				test.assertEqual(info.imdb.title, "The Expendables 2", 'imdb title');
				test.assertEqual(info.imdb.runtime[0], "103 min", 'imdb runtime');
				test.assertEqual(info.imdb.rating, 7.1, 'imdb rating');

				//check candidates
				test.assertNull(info.candidates, 'NO candidates expected');

				test.end();
			})
			.fail(function(err){
				test.fail('should work : ' + JSON.stringify(err));
			});
	};

	this.testIMDBSearch_02 = function(test){
		//set the a higher timeout since this will connect to the internet to the imdb website
		test.newTimeOut(2 * 1000);//2 seconds

		var fileName = 'Brave (2012).mkv';
		var mediaFile = new MediaFile(fileName, comedyFolder);

		//scrape
		imdbOrgScraper.mediaFile = mediaFile;
		imdbOrgScraper.search()
			.done(function(info){
				//media info
				test.assertNotNull(info, 'info shoult not be null');
				test.assertEqual(info.imdb.imdb_id, "tt1217209", 'imdb id');
				test.assertEqual(info.imdb.title, "Brave", 'imdb title');
				test.assertEqual(info.imdb.runtime[0], "93 min", 'imdb runtime');
				test.assertEqual(info.imdb.rating, 7.4, 'imdb rating');

				test.assertEqual(info.imdb.genres[0], "Animation", 'imdb genres');
				test.assertEqual(info.imdb.genres[1], "Action", 'imdb genres');
				
				//check candidates
				test.assertNull(info.candidates, 'NO candidates expected');

				test.end();
			})
			.fail(function(err){
				test.fail('should work : ' + JSON.stringify(err));
			});
	};

});

ImdbOrgScraperTest.setup(module);