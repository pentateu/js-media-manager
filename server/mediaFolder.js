var fs = require('fs'); 
var path = require('path');

var mediaFile = require('./mediaFile');
var promisse = require("./promisse");

function readDir(mediaList, folderInfo){

	var myPromisse = promisse.newPromisse();

	fs.readdir(folderInfo.path, function(err, files){
		//check for errors
		if (err){
			console.log('error on fs.readdir() for path : ' + folderInfo.path + ' err: ' + err);
			myPromisse.reject(err);
		}

		var nothingFound = true;
		for (var j = 0; j < files.length; j++){
			var file = files[j];
			var fullPath = path.resolve(folderInfo.path, file);

			//check if its a file or folder
			var stats = fs.statSync(fullPath);

			if(stats.isFile()){
				nothingFound = false;
				//pending++;
				myPromisse.chain(
					mediaFile.getMediaInfo(file, folderInfo, stats).
						done(function(mediaInfo){
							//process the media info
							mediaList.add(mediaInfo);
							console.log('media info processed for the file : ' + fullPath);
						})
						.fail(function(err){
							//could not find media info for the file
							console.log('could not find media info for the file : ' + fullPath);
						})
				);
			}
			else if(stats.isDirectory()){
				nothingFound = false;
				//keep reading sub-folders
				myPromisse.chain(readDir(mediaList, {path:fullPath, type:folderInfo.type}));
			}
			else{
				//file type not supported
				console.log('file stat not supported: ' + fullPath);
			}
		}
		//when no files or subfolers are found
		if(nothingFound){
			console.log('no files or sub-folders found for folder: ' + folderInfo.path);
			myPromisse.resolve();
		}
	});
	
	return myPromisse;
}

exports.readDir = readDir;