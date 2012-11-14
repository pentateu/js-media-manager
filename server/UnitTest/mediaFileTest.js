//dependencies
var fs = require('fs'); 
var pathLib = require('path');

var testUtils = require("./testUtils");

var MediaFile = require('../mediaFile');
var MediaFolder = require('../mediaFolder');
var MediaScraper = require('../mediaScraper');
var Promisse = require('../promisse');

//load test config
var testConfig = JSON.parse(fs.readFileSync('./testConfig.json'));

//export the name of the test script
exports.name = module.filename;

var comedyFolder = new MediaFolder({path:testConfig.baseTestMediaFolder + '/My Movie Archive/Comedy', type:'movies'});

//test loading the info file
function scenario1(test){
	test.name = "Scenario 1 - Test MediaFile.loadInfoFile() for an existing info file.";

	var fileName, mediaFolder, ext;

	ext = 'mkv';
	fileName = 'Expendables 2 (2012).mkv';
	mediaFolder = new MediaFolder({path:testConfig.baseTestMediaFolder + '/New Movies', type:'movies'});

	var mediaFile = new MediaFile(fileName, mediaFolder);

	mediaFile.loadInfoFile()
		.done(function(info){
			//test the media file
			test.assertNotNull(info, 'valid info file');

			test.assertNotNull(info.imdb, 'media file with imdb metadata');

			test.assertEqual(info.title, 'The Expendables 2', 'proper imdb title');

			test.assertFalse(info.watched, 'watched false');

			test.assertEqual(info.imdb.id, 'tt1764651', 'proper imdb id');

			test.end();
		})
		.fail(function(err){
			test.fail('should work! err.code: ' + err.code + ' err.cause: ' + err.cause);
		});
}

//test MediaFile save
function scenario2(test){
	test.name = "Scenario 2 - Test MediaFile save()";

	var fileName = 'The Campaign (2012).avi';
	var infoFileName = 'The Campaign (2012).info';
	var infoPath = pathLib.resolve(comedyFolder.path, infoFileName);

	test.tearDown(function(log){
		//delete the info file
		fs.unlink(infoPath, function(err){
			if(err){
				log('could not delete info file. err: ' + err);
			}
			else{
				log('Info file deleted!');
			}
		});
	});

	var mediaFile = new MediaFile(fileName, comedyFolder);

	//set the info 
	mediaFile.info = {
		"title" : "The Campaign",
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
				
				test.assertEqual(savedInfo.title, "The Campaign", 'same title');
				test.assertFalse(savedInfo.watched, 'watched is false');
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
}

//error conditions for invalid parameters
function scenario3(test){
	test.name = "Scenario 3 - error conditions for invalid parameters";

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
}

function scenario4(test){
	test.name = "Scenario 4 - Try to load an invalid info file.";

	var fileName = 'Mr Bean.avi';
	var infoFileName = 'Mr Bean.info';
	var infoPath = pathLib.resolve(comedyFolder.path, infoFileName);

	test.tearDown(function(log){
		//delete the info file
		fs.unlink(infoPath, function(err){
			if(err){
				log('could not delete info file. err: ' + err);
			}
			else{
				log('Info file deleted!');
			}
		});
	});

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
}



//test full scraping cycle
function scenario5(test){
	test.name = "Scenario 5 - scraping info details.";

	var fileName = 'The Campaign (2012).avi';
	
	//stub the scrape functions
	MediaScraper.scrape = function(mediaFile){
		//console.log(' *** (Stub) Running MediaScraper.scrape() stub. ***');
		var p = new Promisse();
		p.resolve({
			"title" : "The Campaign",
			"watched" : "false",
			"imdb" : {
				"title" : "The Campaign",
				"year" : "2012",
				"id" : "tt1790886",
				"rating" : "6.2"
			}
		});
		return p;
	};

	MediaFile.get(fileName, comedyFolder)
		.done(function(mediaFile){

			//console.log('mediaFile: ' + JSON.stringify(mediaFile));

			//test the media file
			test.assertNotNull(mediaFile, 'valid media file');

			test.assertNotNull(mediaFile.info, 'media file with imdb metadata');

			test.assertNotNull(mediaFile.info.imdb, 'media file with imdb metadata');

			test.assertEqual(mediaFile.info.imdb.id, 'tt1790886', 'proper imdb id');

			test.assertEqual(mediaFile.info.imdb.title, 'The Campaign', 'proper imdb title');

			test.assertEqual(mediaFile.info.imdb.year, '2012', 'proper imdb year');

			test.end();
		})
		.fail(function(err){
			test.fail('should work! err: ' + JSON.stringify(err));
		});
}

exports.run = function(){
	//running the tests
	testUtils.add(scenario1);
	testUtils.add(scenario2);
	testUtils.add(scenario3);
	testUtils.add(scenario4);
	testUtils.add(scenario5);

	testUtils.run();
};