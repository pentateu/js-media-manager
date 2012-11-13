//modules
var fs	 	= require('fs'); 
var pathLib = require('path');

var Promisse = require("./promisse");

var MediaScraper = require("./mediaScraper");

//constants
//error codes
var ERROR_INFO_CANT_OPEN = 1001;
var ERROR_INFO_CANT_PARSE = 1002;

//local vars
var mediaInfoCache = {};

var MediaFile = module.exports = function(fileName, mediaFolder, ext) {
	//make sure it behaves as a constructor
	if ( ! (this instanceof MediaFile) ) {
		return new MediaFile(fileName, mediaFolder, ext);
	}

	this.fileName = fileName;
	this.mediaFolder = mediaFolder;
	this.extension = ext;

	//this.options = options;

};

//get the media file for a given file location
var get = MediaFile.get = function(fileName, mediaFolder, stats){
	var myPromisse = new Promisse();

	//ful path
	var path = pathLib.resolve(mediaFolder.path, fileName);

	if( ! stats){
		stats = fs.statSync(path);
	}

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
			loadMediaFile(myPromisse, path, fileName, mediaFolder, ext, stats);
			break;
		default:
			console.log('file ext not supported : ' + ext);
			myPromisse.reject('File is not a media file. ext: ' + ext);
			break;
	}
	return myPromisse;
};

//load the Media File details from the file system
var loadMediaFile = MediaFile.loadMediaFile = function(myPromisse, path, fileName, mediaFolder, ext, stats){
	var mediaFile = mediaInfoCache[path];

	if(mediaFile != null){ //media in cache
		myPromisse.resolve(mediaFile);
	}
	else{

		mediaFile = new MediaFile(fileName, mediaFolder, ext);

		//no media in cache
		//1: try to load the info file
		loadInfoFile(mediaFolder, fileName, ext)
			.done(function(info){
				//info loaded
				mediaFile.info = scrapeState.info;
				mediaFile.save().done(function(){
					myPromisse.resolve(mediaFile);
				})
				.fail(function(err){
					//error when saving media info details

				});
			})
			.fail(function(err){
				//failed to load the info file
				//check error code
				if(err.code === ERROR_INFO_CANT_OPEN){
					console.log('info not found, scrape from the internet!');
					
					MediaScraper.scrape(mediaFile)
						.done(function(info){
							//if(scrapeState.status == MediaScraper.STATUS_MEDIA_FOUND){
							//media details was found by the scrapers and the info object is returned
							mediaFile.info = info;
							mediaFile.save().done(function(){
								myPromisse.resolve(mediaFile);
							})
							.fail(function(err){
								//error when saving media info details
								
							});
							//}
							//if(scrapeState.status == MediaScraper.STATUS_NEED_CONFIRMATION){
							//	media.candidates = scrapeState.candidates;

							//}
						})
						.fail(function(err){
							//fail on scraping

						});
				}
			});

		//mediaFile = new MediaFile({title:fileName, fileName:fileName, path:path, mediaFolder:mediaFolder, stats:stats});
	}
	
}

var loadInfoFile = MediaFile.loadInfoFile = function(mediaFolder, fileName, ext){
	var p = new Promisse();
	//try to load the info file
	var infoFileName = fileName.replace('.' + ext, '.info');
	//path for info file
	var path = pathLib.resolve(mediaFolder.path, infoFileName);

	//console.log('Loading info file: ' + path);

	//open file
	fs.readFile(path, function(err, data){
		//check for errors
		if (err){
			p.reject({code:ERROR_INFO_CANT_OPEN, cause:err});
			return;
		}

		var info = null;
		//try to parse the content
		try{
			info = JSON.parse(data);
			p.resolve(info);
		}
		catch(err){
			console.log('could not parse the info file: ' + err);
			p.reject({code:ERROR_INFO_CANT_PARSE, cause:err});
			return;
		}
	});
	return p;
}
