//dependencies
var fs = require('fs'); 
var pathLib = require('path');

var MediaFile = require('../mediaFile');
var MediaFolder = require('../mediaFolder');
var MediaScraper = require('../mediaScraper');
var Promisse = require('../promisse');

var UnitTest = require('./unitTest');

//load test config
var testConfig = JSON.parse(fs.readFileSync('./testConfig.json'));

var comedyFolder = MediaFolder.get({path:testConfig.baseTestMediaFolder + '/My Movie Archive/Comedy', type:'movies'});
var newMoviesFolder = MediaFolder.get({path:testConfig.baseTestMediaFolder + '/New Movies', type:'movies'});

var MediaFileTest = module.exports = new UnitTest(function(){
	//test loading the info file
	this.testLoadInfoFile = function(test){
		test.name = "Test MediaFile.loadInfoFile() for an existing info file.";

		//create the info file
		var infoFileName = 'Expendables 2 (2012).info';
		var infoPath = pathLib.resolve(newMoviesFolder.path, infoFileName);

		//create info file
		fs.writeFileSync(infoPath, JSON.stringify({
			"watched" : "false",
			"imdb" : {
				"title" : "The Expendables 2",
				"year" : "2012",
				"imdb_id" : "tt1764651",
				"rating" : "7.1"
			}
		}));
		test.tearDown(test.deleteFileTearDown(infoPath));
		
		var fileName, mediaFolder;

		fileName = 'Expendables 2 (2012).mkv';
		mediaFolder = MediaFolder.get({path:testConfig.baseTestMediaFolder + '/New Movies', type:'movies'});

		var mediaFile = new MediaFile(fileName, mediaFolder);

		mediaFile.loadInfoFile()
			.done(function(info){
				//test the media file
				test.assertNotNull(info, 'valid info file');

				test.assertNotNull(info.imdb, 'media file with imdb metadata');

				test.assertEqual(info.imdb.title, 'The Expendables 2', 'proper imdb title');

				test.assertEqual(info.watched, "false", 'watched false');

				test.assertEqual(info.imdb.imdb_id, 'tt1764651', 'proper imdb id');

				test.end();
			})
			.fail(function(err){
				test.fail('should work! err.code: ' + err.code + ' err.cause: ' + err.cause);
			});
	};

	//test MediaFile save
	this.testSave = function(test){
		test.name = "Test MediaFile save()";

		var fileName = 'The Campaign (2012).avi';
		var infoFileName = 'The Campaign (2012).info';
		var infoPath = pathLib.resolve(comedyFolder.path, infoFileName);

		test.tearDown(test.deleteFileTearDown(infoPath));

		var mediaFile = new MediaFile(fileName, comedyFolder);

		//set the info 
		mediaFile.info = {
			"watched" : "false",
			"imdb" : {
				"title" : "The Campaign",
				"year" : "2012",
				"id" : "tt1790886",
				"rating" : "6.2"
			}
		};

		mediaFile.save()
			.done(function(){
				//check that the file has been saved
				try{
					var savedInfo = JSON.parse(fs.readFileSync(infoPath));
					//
					test.assertEqual(savedInfo.imdb.title, "The Campaign", 'same title');
					test.assertEqual(savedInfo.watched, "false", 'watched is false');
					test.assertNotNull(savedInfo.imdb, 'imdb not null');
					test.assertEqual(savedInfo.imdb.year, "2012", 'same year');

					test.end();
				}
				catch(err){
					test.fail('invalid info json. err: ' + JSON.stringify(err));
				}
			})
			.fail(function(err){
				test.fail('no exception expected. err: ' + JSON.stringify(err));
			});
	};

	//error conditions for invalid parameters
	this.testInvalidParameters = function(test){
		test.name = "Error conditions for invalid parameters";

		var fileName = 'The Campaign (2012).avi';

		test.assertThrows(function(){
			var mediaFile = new MediaFile('xxx');
		}, 
		'show throw error for invalid mediaFolder parameter');

		test.assertThrows(function(){
			var mediaFile = new MediaFile(null, comedyFolder);
		}, 
		'show throw error for invalid fileName parameter');

		test.assertNotThrows(function(){
			var mediaFile = new MediaFile(fileName, comedyFolder);
		}, 
		'valid parameters.');

		test.assertNotThrows(function(){
			var mediaFile = new MediaFile(fileName, comedyFolder, 'avi');
		}, 
		'valid parameters.');

		test.end();
	};

	this.testInvalidInfoFile = function(test){
		test.name = "Try to load an invalid info file.";

		var fileName = 'Mr Bean.avi';
		var infoFileName = 'Mr Bean.info';
		var infoPath = pathLib.resolve(comedyFolder.path, infoFileName);
		test.tearDown(test.deleteFileTearDown(infoPath));

		//create an invalid info file
		fs.writeFileSync(infoPath, '{invalid json file}...');

		var mediaFile = new MediaFile(fileName, comedyFolder);

		mediaFile.loadInfoFile()
			.done(function(info){
				test.fail('should not be able to load info file! : info: ' + JSON.stringify(info));
			})
			.fail(function(err){
				console.log('\n' + JSON.stringify(err) + '\n');
				test.end();
			});
	};

	//test with scraping mock
	this.testScrapingWithMockScraper = function(test){
		
		var fileName = 'The Campaign (2012).avi';
		
		//setup tear down
		var infoFileName = 'The Campaign (2012).info';
		var infoPath = pathLib.resolve(comedyFolder.path, infoFileName);
		var posterImagePath = pathLib.resolve(comedyFolder.path, 'The Campaign (2012).jpg');
		
		test.tearDown(test.deleteFileTearDown(infoPath));

		//stub the scrape functions
		MediaFile.getScraper = function(){
			return {
				scrape:function(mediaFile){
					//console.log(' *** (Stub) Running MediaScraper.scrape() stub. ***');
					var p = new Promisse();
					p.resolve({
						"watched" : "false",
						"imdb" : {
							"title" : "The Campaign",
							"year" : "2012",
							"imdb_id" : "tt1790886",
							"rating" : "6.2"
						}
					});
					return p;
				}
			}
		};

		MediaFile.get(fileName, comedyFolder)
			.done(function(mediaFile){

				//test the media file
				test.assertNotNull(mediaFile, 'valid media file');

				test.assertNotNull(mediaFile.info, 'media file with imdb metadata');

				test.assertNotNull(mediaFile.info.imdb, 'media file with imdb metadata');

				test.assertEqual(mediaFile.info.imdb.imdb_id, 'tt1790886', 'proper imdb id');

				test.assertEqual(mediaFile.info.imdb.title, 'The Campaign', 'proper imdb title');

				test.assertEqual(mediaFile.info.imdb.year, '2012', 'proper imdb year');

				//make sure no poster image has been downloaded
				// /Users/rafaelalmeida/Developer/NodeJS/js-media-manager/media_unitTest_folders/My Movie Archive/Comedy/The Campaign (2012).info
				test.assertFileDoesNotExist(posterImagePath, 'poster image sould not exist.');
				//test.assertFileExist(posterImagePath, 'poster image should exist.');


				test.end();
			})
			.fail(function(err){
				test.fail('should work! err: ' + JSON.stringify(err));
			});
	};

	//test with ImgDownloader mock
	this.testScrapingWithMockImgDownloader = function(test){
		var fileName = 'The Campaign (2012).avi';
		
		//setup tear down
		var infoFileName = 'The Campaign (2012).info';
		var infoPath = pathLib.resolve(comedyFolder.path, infoFileName);
		var posterImagePath = pathLib.resolve(comedyFolder.path, 'The Campaign (2012).jpg');
		
		test.tearDown( [ test.deleteFileTearDown(infoPath), 
						 test.deleteFileTearDown(posterImagePath) ] );

		//clear the cache
		MediaFile.clearCache();

		//stub the scrape functions
		MediaFile.getScraper = function(){
			return {
				scrape:function(mediaFile){
					//console.log('(Mock Scraper) - ');
					var p = new Promisse();
					p.resolve({
						"watched" : "false",
						"imdb" : {
							"title" : "The Campaign",
							"year" : "2012",
							"imdb_id" : "tt1790886",
							"rating" : "6.2",
							"poster" : "http://ia.media-imdb.com/images/M/MV5BMTY0NjI3MzM2Nl5BMl5BanBnXkFtZTcwNDgxNjA5Nw@@._V1._SY317_CR0,0,214,317_.jpg"
						}
					});
					return p;
				}
			}
		};

		//stub the img downloader
		MediaFile.getImgDownloader = function(url, filePath){
			return {
				download:function(){
					var p = new Promisse();
					//create a dummy file
					fs.writeFileSync(filePath, 'Dummy file content !!!');

					//console.log('(Mock ImgDownloader) Img poster file saved : ' + filePath);

					p.resolve();
					return p;
				}
			};
		};

		MediaFile.get(fileName, comedyFolder)
			.done(function(mediaFile){

				//test the media file
				test.assertNotNull(mediaFile, 'valid media file');

				test.assertNotNull(mediaFile.info, 'media file with imdb metadata');

				test.assertNotNull(mediaFile.info.imdb, 'media file with imdb metadata');

				test.assertEqual(mediaFile.info.imdb.imdb_id, 'tt1790886', 'proper imdb id');

				test.assertEqual(mediaFile.info.imdb.title, 'The Campaign', 'proper imdb title');

				test.assertEqual(mediaFile.info.imdb.year, '2012', 'proper imdb year');

				//validate poster image
				//make sure no poster image has been downloaded
				test.assertFileExist(posterImagePath, 'poster image should exist.');
				test.assertEqual(mediaFile.posterPath, posterImagePath, 'proper imdb year');

				test.end();
			})
			.fail(function(err){
				test.fail('should work! err: ' + JSON.stringify(err));
			});
	};

	this.testRegExpCleanExtension = function(test){

		var fileName = 'The.Expendables.2 (2012).mkv';

		var cleanUp = MediaFile.mediaTitleCleanUp[0];

		fileName = cleanUp.run(fileName);

		test.assertEqual(fileName, "The.Expendables.2 (2012)", 'Extension removed.');

		test.end();
	};

	this.testRegExpCleanYear = function(test){
		//format 1 : (year)
		var fileName = 'The.Expendables.2 (2012).mkv';
		var cleanUp = MediaFile.mediaTitleCleanUp[1];

		fileName = cleanUp.run(fileName);
		test.assertEqual(fileName, "The.Expendables.2 .mkv", 'Year removed.');

		//format 2 : .year
		fileName = 'The.Expendables.2.2012.mkv';

		fileName = cleanUp.run(fileName);
		test.assertEqual(fileName, "The.Expendables.2.mkv", 'Year removed.');

		test.end();
	};

	this.testRegExpCleanFileInfo = function(test){
		//1
		var fileName = 'Cartas de Iwo Jima.2006 - 2.Aud.AC3.5.1.JP.BR] 2.Sub.BR.EN.mkv';
		var cleanUp = MediaFile.mediaTitleCleanUp[2];

		fileName = cleanUp.run(fileName);

		test.assertEqual(fileName, "Cartas de Iwo Jima.2006 - .. .mkv", 'File info removed.');

		test.end();
	};

	this.testRegExpCleanPonctuation = function(test){
		//1
		var fileName = 'Cartas de Iwo Jima.2006 - .... _ ...mkv';
		var cleanUp = MediaFile.mediaTitleCleanUp[3];

		fileName = cleanUp.run(fileName);

		test.assertEqual(fileName, "Cartas de Iwo Jima 2006 mkv", 'Ponctuation removed.');

		test.end();
	};

	//test GetListOfTitles
	this.testCleanTitle = function(test){
		
		var fileName;

		//1
		fileName = 'Cartas de Iwo Jima.2006 - 2.Aud.AC3.5.1.JP.BR] 2.Sub.BR.EN.mkv';
		fileName = MediaFile.cleanTitle(fileName);
		test.assertEqual(fileName, "Cartas De Iwo Jima", 'Clean title');

		//2
		fileName = 'stolen.720_261012.mkv';
		fileName = MediaFile.cleanTitle(fileName);
		test.assertEqual(fileName, "Stolen", 'Clean title');

		//3
		fileName = 'ddlsource.com_The.Watch.2012.720p.HDrip.AC3-ViBE.avi';
		fileName = MediaFile.cleanTitle(fileName);
		test.assertEqual(fileName, "The Watch", 'Clean title');
		
		//4
		fileName = 'ddlsource.com_total.recall.2012.extended.dc.720p.bluray.dts.x264-publichd.mkv';
		fileName = MediaFile.cleanTitle(fileName);
		test.assertEqual(fileName, "Total Recall", 'Clean title');

		//5
		fileName = 'History.Channel.Titanic.100.Years.In.3D.2012.720p.mkv';
		fileName = MediaFile.cleanTitle(fileName);
		test.assertEqual(fileName, "History Channel Titanic 100 Years In 3D", 'Clean title');

		//6
		fileName = 'Surfer Dude DVDRip.avi';
		fileName = MediaFile.cleanTitle(fileName);
		test.assertEqual(fileName, "Surfer Dude", 'Clean title');

		//7
		fileName = 'Indiana Jones and the Kingdom of the Crystal Skull - 720P.mkv';
		fileName = MediaFile.cleanTitle(fileName);
		test.assertEqual(fileName, "Indiana Jones And The Kingdom Of The Crystal Skull", 'Clean title');

		test.end();

	};

	this.testGetYear = function(test){
		var fileName, year;

		//1
		fileName = 'Cartas de Iwo Jima.2006 - 2.Aud.AC3.5.1.JP.BR] 2.Sub.BR.EN.mkv';
		year = MediaFile.getYear(fileName);
		test.assertEqual(year, "2006", 'year from filename');

		//2
		fileName = 'stolen.720_261012.mkv';
		year = MediaFile.getYear(fileName);
		test.assertNull(year, 'year from filename');

		//3
		fileName = 'ddlsource.com_The.Watch.2012.720p.HDrip.AC3-ViBE.avi';
		year = MediaFile.getYear(fileName);
		test.assertEqual(year, "2012", 'year from filename');
		
		//4
		fileName = 'ddlsource.com_total.recall.2012.extended.dc.720p.bluray.dts.x264-publichd.mkv';
		year = MediaFile.getYear(fileName);
		test.assertEqual(year, "2012", 'year from filename');

		//5
		fileName = 'History.Channel.Titanic.100.Years.In.3D.2012.720p.mkv';
		year = MediaFile.getYear(fileName);
		test.assertEqual(year, "2012", 'year from filename');

		//6
		fileName = 'Iron Man (2008).mkv';
		year = MediaFile.getYear(fileName);
		test.assertEqual(year, "2008", 'year from filename');

		test.end();
	};
});

MediaFileTest.setup(module);