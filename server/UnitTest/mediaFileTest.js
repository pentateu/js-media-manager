var testUtils = require("./testUtils");
var assert
exports.name = module.filename;

var MediaFile = require('../mediaFile');
var MediaFolder = require('../mediaFolder');

//test loading the info file
function scenario1(test){
	var fileName, mediaFolder, ext;

	ext = 'mkv';
	fileName = 'Expendables 2 (2012).mkv';
	mediaFolder = new MediaFolder({path:'/Users/rafaelalmeida/Developer/NodeJS/js-media-manager/media_test_folders/New Movies', type:'movies'});

	MediaFile.loadInfoFile(mediaFolder, fileName, ext).done(function(info){
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



function scenario2(test){

	var fileName, mediaFolder;

	fileName = 'Surfer Dude DVDRip.avi';
	mediaFolder = new MediaFolder({path:'/Volumes/BOOTCAMP/Users/rafael/Documents/media_test_folders/My Movie Archive/Comedy', type:'movies'});

	MediaFile.get(fileName, mediaFolder)
		.done(function(mediaFile){
			//test the media file
			test.assertNotNull(mediaFile, 'valid media file');

			test.assertNotNull(mediaFile.imdb, 'media file with imdb metadata');

			test.assertEqual(mediaFile.imdb.id, 'tt1764651', 'proper imdb id');

			test.end();
		})
		.fail(function(err){
			test.fail('should work! err.code: ' + err.code + ' err.cause: ' + err.cause);
		});

}

exports.run = function(){
	//running the tests
	testUtils.run(scenario1, "Scenario 1");
	testUtils.run(scenario2, "Scenario 2");
};