//modules
var fs = require('fs'); 
var path = require('path');

var promisse = require("./promisse");

//local vars
var mediaInfoCache = {};

function getMediaInfoImpl(fileName, folderInfo, stats){
	var myPromisse = promisse.newPromisse();

	var fullPath = path.resolve(folderInfo.path, fileName);

	var mediaInfo = mediaInfoCache[fullPath];

	if(mediaInfo == null){
		//media not in cache
		mediaInfo = {title:fileName, posterImage:'url test'};
	}

	return mediaInfo;
}

//get the media info for a given file
function getMediaInfo(fileName, folderInfo, stats){
	var myPromisse = promisse.newPromisse();

	//validate input
	if( ! stats.isFile()){
		myPromisse.reject('Not a file!');
	}

	//check extension
	var ext = fileName.substring(fileName.lastIndexOf('.') + 1, fileName.lenght);
	
	switch(ext){
		case 'avi':
		case 'mkv':
		case 'mp4':
			//get media info
			myPromisse.resolve(getMediaInfoImpl(fileName, folderInfo, stats));
			break;
		default:
			console.log('file ext not supported : ' + ext);
			myPromisse.reject('File is not a media file. ext: ' + ext);
			break;
	}
	return myPromisse;
}


exports.getMediaInfo = getMediaInfo;

