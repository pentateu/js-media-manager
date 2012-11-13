var fs 		= require('fs'); 
var pathLib 	= require('path');

var MediaFile 	= require('./mediaFile');
var Promisse 	= require("./promisse");

var MediaFolder = module.exports = function(folderInfo) {
	//make sure it behaves as a constructor
	if ( ! (this instanceof MediaFolder) ) {
		return new MediaFolder(folderInfo);
	}

	var mediaFolder = this;

	var parent = folderInfo.parent;

	var path = this.path = folderInfo.path;

	var scanForMediaFiles = this.scanForMediaFiles = function(mediaList){

		var myPromisse = new Promisse();

		fs.readdir(path, function(err, files){
			//check for errors
			if (err){
				console.log('error on fs.readdir() for path : ' + path + ' err: ' + err);
				myPromisse.reject(err);
			}

			var nothingFound = true;
			files.forEach(function(file){
				//ful path
				var fullPath = pathLib.resolve(path, file);
				//check if its a file or folder
				var stats = fs.statSync(fullPath);
				//check if it is a file
				if(stats.isFile()){
					nothingFound = false;
					//pending++;
					myPromisse.chain(
						MediaFile.get(file, mediaFolder, stats).
							done(function(mediaFile){
								//add the media file to the media list
								mediaList.add(mediaFile);
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

					var subMediaFolder = new MediaFolder({path:fullPath, type:folderInfo.type, parent:mediaFolder});

					//keep reading sub-folders
					myPromisse.chain(subMediaFolder.scanForMediaFiles(mediaList));
				}
				else{
					//file type not supported
					console.log('file stat not supported: ' + fullPath);
				}
			});

			//when no files or subfolers are found
			if(nothingFound){
				console.log('no files or sub-folders found for folder: ' + path);
				myPromisse.resolve();
			}
		});
		return myPromisse;
	};
};