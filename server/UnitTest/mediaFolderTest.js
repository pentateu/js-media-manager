//dependencies
var fs = require('fs'); 
var pathLib = require('path');

var MediaFile 		= require('../mediaFile');
var MediaFolder 	= require('../mediaFolder');
var Promisse 		= require('../promisse');
var Util 			= require('../util');

var UnitTest = require('./unitTest');

//load test config
var testConfig = JSON.parse(fs.readFileSync('./testConfig.json'));


var MediaFolderTest = module.exports = new UnitTest(function(){
	
	//variables available for all test cases
	//var comedyFolder = MediaFolder.get({path:testConfig.baseTestMediaFolder + '/My Movie Archive/Comedy', type:'movies'});
	//var newMoviesFolder = MediaFolder.get({path:testConfig.baseTestMediaFolder + '/New Movies', type:'movies'});

	var infoPathExpendables = pathLib.resolve(testConfig.baseTestMediaFolder + '/New Movies', 'Expendables 2 (2012).info');

	//setup method that create mocks, files and anythig required to support the test cases
	//this method is invoked before any test methods
	this.setup = function(test){
		
		//create info file
		fs.writeFileSync(infoPathExpendables, JSON.stringify({
			"title" : "The Expendables 2",
			"watched" : "false",
			"imdb" : {
				"title" : "The Expendables 2",
				"year" : "2012",
				"imdb_id" : "tt1764651",
				"rating" : "7.1"
			}
		}));

		test.end();
	};

	//method that runs after all test case methods have been executed and completed.
	this.tearDown = function(test){

		test.tearDown(test.deleteFileTearDown(infoPathExpendables));

		test.end();
	};

	this.testUpdate = function(test){
		test.newTimeOut(2 * 1000);//2 seconds


		var rootFolder 	= pathLib.join(testConfig.baseTestMediaFolder, 'update_folder_test');
		var mFile1 		= pathLib.join(rootFolder, 'movie name.mkv');
		var iFile1 		= pathLib.join(rootFolder, 'movie name.info');
		var subFolder1 	= pathLib.join(rootFolder, 'sub01');
		var mFile2 		= pathLib.join(subFolder1, 'movie2 name.mkv');
		var iFile2 		= pathLib.join(subFolder1, 'movie2 name.info');

		//create a test folder and test files
		test.tearDown([
			test.deleteFileTearDown(mFile2),
			test.deleteFileTearDown(iFile2),
			test.deleteFolderTearDown(subFolder1),
			test.deleteFileTearDown(mFile1),
			test.deleteFileTearDown(iFile1),
			test.deleteFolderTearDown(rootFolder)
			]);
		
		var dummyInfo = JSON.stringify({
			"title" : "movie name",
			"watched" : "false",
			"imdb" : {
				"title" : "movie name",
				"year" : "2012",
				"imdb_id" : "tt1764651",
				"rating" : "7.1"
			}
		});

		fs.mkdirSync(rootFolder);
		fs.mkdirSync(subFolder1);
		fs.writeFileSync(mFile1, 'dummy content');
		fs.writeFileSync(iFile1, dummyInfo);
		fs.writeFileSync(mFile2, 'dummy content');
		fs.writeFileSync(iFile2, dummyInfo);

		var mediaFolder = MediaFolder.get({path:rootFolder});

		var updateEventCalled = false;

		mediaFolder.on(MediaFolder.UPDATE_EVENT, function(){	
			updateEventCalled = true;
		});	

		mediaFolder.on(MediaFolder.FILES_ADDED_EVENT, function(newMediaFiles){
			//wrap the assers/verification to make sure the tests continue running even if an exception occours
			test.evaluate(function(){
				//folder have one media file
				test.assertEqual(newMediaFiles.size(), 1, 'one item in the mediaFileList');
				test.assertEqual(newMediaFiles[0].fileName, 'movie name.mkv', 'mediaFile fileName on mediaFileList');

				//test.assertEqual(newMediaFiles[1].fileName, 'movie2 name.mkv', 'mediaFile fileName on mediaFileList');

				test.assertTrue(updateEventCalled, 'update Event Called');
			});
		});

		mediaFolder.on(MediaFolder.UPDATE_COMPLETE_EVENT, function(){
			//wrap the assers/verification to make sure the tests continue running even if an exception occours
			test.evaluate(function(){
				//folder have one media file
				test.assertEqual(mediaFolder.mediaFileList.size(), 1, 'one item in the mediaFileList');
				test.assertEqual(mediaFolder.mediaFileList[0].fileName, 'movie name.mkv', 'mediaFile fileName on mediaFileList');
				
				//validate sub foder
				test.assertEqual(mediaFolder.subFolders.size(), 1, 'one sub folder');
				test.assertNotNull(mediaFolder.subFolders[0].parent, 'sub folder parent not null');
				test.assertEqual(mediaFolder.subFolders[0].path, subFolder1, 'sub folder path');
				test.assertEqual(mediaFolder.subFolders[0].parent.path, rootFolder, 'sub folder parent path');
				
				test.assertEqual(mediaFolder.subFolders[0].mediaFileList.size(), 1, 'one item on subfolder.mediaFileList');
				test.assertEqual(mediaFolder.subFolders[0].mediaFileList[0].fileName, 'movie2 name.mkv', 'mediaFile fileName on subfolder.mediaFileList');
				
				//create new files and call update

				test.end();
			});
		});

		mediaFolder.update();
	};

	this.testUpdate_addFilesFoders = function(test){
		test.newTimeOut(2 * 1000);//2 seconds

		var rootFolder 	= pathLib.join(testConfig.baseTestMediaFolder, 'update_folder_test2');
		var mFile1 		= pathLib.join(rootFolder, 'movie name.mkv');
		var iFile1 		= pathLib.join(rootFolder, 'movie name.info');
		var subFolder1 	= pathLib.join(rootFolder, 'sub01');
		var mFile2 		= pathLib.join(subFolder1, 'movie2 name.mkv');
		var iFile2 		= pathLib.join(subFolder1, 'movie2 name.info');

		//create a test folder and test files
		test.tearDown([
			test.deleteFileTearDown(mFile2),
			test.deleteFileTearDown(iFile2),
			test.deleteFolderTearDown(subFolder1),
			test.deleteFileTearDown(mFile1),
			test.deleteFileTearDown(iFile1),
			test.deleteFolderTearDown(rootFolder)
			]);
		
		var dummyInfo = JSON.stringify({
			"title" : "movie name",
			"watched" : "false",
			"imdb" : {
				"title" : "movie name",
				"year" : "2012",
				"imdb_id" : "tt1764651",
				"rating" : "7.1"
			}
		});

		fs.mkdirSync(rootFolder);
		fs.writeFileSync(mFile1, 'dummy content');
		fs.writeFileSync(iFile1, dummyInfo);
		
		var mediaFolder = MediaFolder.get({path:rootFolder});

		var updateEventCalled = false;

		mediaFolder.on(MediaFolder.UPDATE_EVENT, function(){	
			updateEventCalled = true;
		});	

		mediaFolder.once(MediaFolder.FILES_ADDED_EVENT, function(newMediaFiles){
			//wrap the assers/verification to make sure the tests continue running even if an exception occours
			test.evaluate(function(){
				//folder have one media file
				test.assertEqual(newMediaFiles.size(), 1, 'one item in the mediaFileList');
				test.assertEqual(newMediaFiles[0].fileName, 'movie name.mkv', 'mediaFile fileName on mediaFileList');

				//test.assertEqual(newMediaFiles[1].fileName, 'movie2 name.mkv', 'mediaFile fileName on mediaFileList');

				test.assertTrue(updateEventCalled, 'update Event Called');
			});
		});

		var totalUpdateCalls = 0;
		mediaFolder.on(MediaFolder.UPDATE_COMPLETE_EVENT, function(){
			totalUpdateCalls += 1;
		});

		mediaFolder.once(MediaFolder.UPDATE_COMPLETE_EVENT, function(){
			//wrap the assers/verification to make sure the tests continue running even if an exception occours
			test.evaluate(function(){
				//folder have one media file
				test.assertEqual(mediaFolder.mediaFileList.size(), 1, 'one item in the mediaFileList');
				test.assertEqual(mediaFolder.mediaFileList[0].fileName, 'movie name.mkv', 'mediaFile fileName on mediaFileList');
				test.assertEqual(mediaFolder.subFolders.size(), 0, 'no sub folder');

				Util.debug('create sub folder and files rootFolder: ' + rootFolder);
				//create new files/folders and call update
				fs.mkdirSync(subFolder1);
				fs.writeFileSync(mFile2, 'dummy content');
				fs.writeFileSync(iFile2, dummyInfo);

				mediaFolder.once(MediaFolder.UPDATE_COMPLETE_EVENT, function(){
					test.evaluate(function(){
						test.assertEqual(mediaFolder.subFolders.size(), 1, 'one sub folder');
						
						test.assertNotNull(mediaFolder.subFolders[0].parent, 'sub folder parent not null');
						test.assertEqual(mediaFolder.subFolders[0].path, subFolder1, 'sub folder path');
						test.assertEqual(mediaFolder.subFolders[0].parent.path, rootFolder, 'sub folder parent path');

						test.assertEqual(mediaFolder.subFolders[0].mediaFileList.size(), 1, 'one item on subfolder.mediaFileList');
						test.assertEqual(mediaFolder.subFolders[0].mediaFileList[0].fileName, 'movie2 name.mkv', 'mediaFile fileName on subfolder.mediaFileList');
					

						//Util.debug('totalUpdateCalls : ' + totalUpdateCalls);
						//2 calls to the update complete event
						test.assertEqual(totalUpdateCalls, 2, '2 calls to the update complete event');

						test.end();
					});
				});

				mediaFolder.update();

			});
		});

		mediaFolder.update();
		mediaFolder.update();
	};

	this.testUpdate_Reconcile = function(test){
		test.newTimeOut(4 * 1000);//2 seconds

		var rootFolder 	= pathLib.join(testConfig.baseTestMediaFolder, 'update_folder_test3');
		var mFile1 		= pathLib.join(rootFolder, 'movie name.mkv');
		var iFile1 		= pathLib.join(rootFolder, 'movie name.info');

		var mFile3 		= pathLib.join(rootFolder, 'movie3 name.mkv');
		var iFile3 		= pathLib.join(rootFolder, 'movie3 name.info');

		var mFile4 		= pathLib.join(rootFolder, 'movie4 name.mkv');
		var iFile4 		= pathLib.join(rootFolder, 'movie4 name.info');

		var mFile5 		= pathLib.join(rootFolder, 'movie5 name.mkv');
		var iFile5 		= pathLib.join(rootFolder, 'movie5 name.info');

		var subFolder1 	= pathLib.join(rootFolder, 'sub01');
		var mFile2 		= pathLib.join(subFolder1, 'movie2 name.mkv');
		var iFile2 		= pathLib.join(subFolder1, 'movie2 name.info');

		//create a test folder and test files
		test.tearDown([
			test.deleteFileTearDown(mFile2, true),
			test.deleteFileTearDown(iFile2, true),
			test.deleteFolderTearDown(subFolder1, true),
			test.deleteFileTearDown(mFile1),
			test.deleteFileTearDown(iFile1),
			test.deleteFileTearDown(mFile3, true),
			test.deleteFileTearDown(iFile3, true),
			test.deleteFileTearDown(mFile4),
			test.deleteFileTearDown(iFile4),
			test.deleteFileTearDown(mFile5, true),
			test.deleteFileTearDown(iFile5, true),
			test.deleteFolderTearDown(rootFolder)
			]);
		
		var dummyInfo = JSON.stringify({
			"title" : "movie name",
			"watched" : "false",
			"imdb" : {
				"title" : "movie name",
				"year" : "2012",
				"imdb_id" : "tt1764651",
				"rating" : "7.1"
			}
		});

		fs.mkdirSync(rootFolder);
		fs.mkdirSync(subFolder1);
		fs.writeFileSync(mFile1, 'dummy content');
		fs.writeFileSync(iFile1, dummyInfo);
		fs.writeFileSync(mFile2, 'dummy content');
		fs.writeFileSync(iFile2, dummyInfo);
		fs.writeFileSync(mFile3, 'dummy content');
		fs.writeFileSync(iFile3, dummyInfo);
		fs.writeFileSync(mFile4, 'dummy content');
		fs.writeFileSync(iFile4, dummyInfo);
		fs.writeFileSync(mFile5, 'dummy content');
		fs.writeFileSync(iFile5, dummyInfo);

		var mediaFolder = MediaFolder.get({path:rootFolder});

		var updateEventCalled = false;

		mediaFolder.on(MediaFolder.UPDATE_EVENT, function(){	
			updateEventCalled = true;
		});	

		mediaFolder.once(MediaFolder.FILES_ADDED_EVENT, function(newMediaFiles){
			//wrap the assers/verification to make sure the tests continue running even if an exception occours
			test.evaluate(function(){
				//folder have one media file
				test.assertEqual(newMediaFiles.size(), 4, 'one item in the mediaFileList');
				test.assertEqual(newMediaFiles[0].fileName, 'movie name.mkv', 'mediaFile fileName on mediaFileList');
				test.assertEqual(newMediaFiles[1].fileName, 'movie3 name.mkv', 'mediaFile fileName on mediaFileList');
				test.assertEqual(newMediaFiles[2].fileName, 'movie4 name.mkv', 'mediaFile fileName on mediaFileList');
				test.assertEqual(newMediaFiles[3].fileName, 'movie5 name.mkv', 'mediaFile fileName on mediaFileList');

				//test.assertEqual(newMediaFiles[1].fileName, 'movie2 name.mkv', 'mediaFile fileName on mediaFileList');

				test.assertTrue(updateEventCalled, 'update Event Called');
			});
		});

		mediaFolder.once(MediaFolder.UPDATE_COMPLETE_EVENT, function(){
			Util.debug('first UPDATE_COMPLETE_EVENT');
			//wrap the assers/verification to make sure the tests continue running even if an exception occours
			test.evaluate(function(){
				//folder have one media file
				test.assertEqual(mediaFolder.mediaFileList.size(), 4, 'one item in the mediaFileList');
				test.assertEqual(mediaFolder.mediaFileList[0].fileName, 'movie name.mkv', 'mediaFile fileName on mediaFileList');
				test.assertEqual(mediaFolder.mediaFileList[1].fileName, 'movie3 name.mkv', 'mediaFile fileName on mediaFileList');
				test.assertEqual(mediaFolder.mediaFileList[2].fileName, 'movie4 name.mkv', 'mediaFile fileName on mediaFileList');
				test.assertEqual(mediaFolder.mediaFileList[3].fileName, 'movie5 name.mkv', 'mediaFile fileName on mediaFileList');
				
				//validate sub foder
				test.assertEqual(mediaFolder.subFolders.size(), 1, 'one sub folder');
				test.assertNotNull(mediaFolder.subFolders[0].parent, 'sub folder parent not null');
				test.assertEqual(mediaFolder.subFolders[0].path, subFolder1, 'sub folder path');
				test.assertEqual(mediaFolder.subFolders[0].parent.path, rootFolder, 'sub folder parent path');
				
				test.assertEqual(mediaFolder.subFolders[0].mediaFileList.size(), 1, 'one item on subfolder.mediaFileList');
				test.assertEqual(mediaFolder.subFolders[0].mediaFileList[0].fileName, 'movie2 name.mkv', 'mediaFile fileName on subfolder.mediaFileList');
				
				//validate folder cache
				test.assertNotNull(global.__MediaFolderCache[subFolder1], 'subFoler is in cache');
				
				//delete subfolder
				fs.unlinkSync(mFile2);
				fs.unlinkSync(iFile2);
				fs.rmdirSync(subFolder1);

				//delete mediaFiles
				fs.unlinkSync(mFile3);
				fs.unlinkSync(iFile3);

				fs.unlinkSync(mFile5);
				fs.unlinkSync(iFile5);

				mediaFolder.once(MediaFolder.UPDATE_COMPLETE_EVENT, function(){
					Util.debug('second UPDATE_COMPLETE_EVENT');
					//wrap the assers/verification to make sure the tests continue running even if an exception occours
					test.evaluate(function(){
						test.assertEqual(mediaFolder.mediaFileList.size(), 2, 'one item in the mediaFileList');
						test.assertEqual(mediaFolder.mediaFileList[0].fileName, 'movie name.mkv', 'mediaFile fileName on mediaFileList');
						test.assertEqual(mediaFolder.mediaFileList[1].fileName, 'movie4 name.mkv', 'mediaFile fileName on mediaFileList');
						
						test.assertEqual(mediaFolder.subFolders.size(), 0, 'NO sub folder');

						//validate folder cache
						test.assertNull(global.__MediaFolderCache[subFolder1], 'subFoler is removed from cache');

						test.end();
					});
				});
				mediaFolder.update();
			});
		});

		mediaFolder.update();
	};

	this.testCachedMediaFolder = function(test){

		var path = pathLib.join(testConfig.baseTestMediaFolder, 'cache_folder_test');

		//create a test folder
		fs.mkdirSync(path);
		test.tearDown(test.deleteFolderTearDown(path));

		//
		var mediaFolder1 = MediaFolder.get({path:path, type:'movies'});

		//add a custom property to instance 1 to test the cache feature
		mediaFolder1.propTest = "testValue";

		mediaFolder1.mediaFileList.add({test1:'testValue'});

		//create a second instance 
		var mediaFolder2 = MediaFolder.get({path:path, type:'movies'});

		test.assertNotNull(mediaFolder2.propTest, 'the cached version should have the propTest');
		test.assertEqual(mediaFolder2.propTest, "testValue", 'propTest value is the same');

		//asser the mediaFileList is correct in the cached instance
		test.assertEqual(mediaFolder2.mediaFileList.size(), 1, 'one item in the mediaFileList');
		test.assertEqual(mediaFolder2.mediaFileList[0].test1, 'testValue', 'testValue on mediaFileList');

		test.end();
	};

	

});

MediaFolderTest.setup(module);

