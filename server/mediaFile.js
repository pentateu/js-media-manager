//modules
var fs	 	= require('fs'); 
var pathLib = require('path');

var Promisse = require("./promisse");

var MediaScraper = require("./mediaScraper");

//local vars
var mediaInfoCache = {};

var MediaFile = module.exports = function(fileName, mediaFolder, ext) {
	//make sure it behaves as a constructor
	if ( ! (this instanceof MediaFile) ) {
		return new MediaFile(fileName, mediaFolder, ext);
	}

	//validate parameters
	if( ! fileName){
		throw {
			code:ERROR_FILENAME_REQUIRED,
			message:"The fileName parameter is required."
		};
	}
	if( ! mediaFolder){
		throw {
			code:ERROR_MEDIAFOLDER_REQUIRED,
			message:"The mediaFolder parameter is required."
		};
	}

	if( ! ext){
		ext = getExt(fileName);
	}

	//constructor
	this.fileName = fileName;
	this.mediaFolder = mediaFolder;
	this.extension = ext;

	//private vars
	//info object for this media file
	var info = null;
	//Info state:
	//0 : Don't exist
	//1 : now saved
	//2 : saved
	var infoState = 0;

	//getter and setters
	this.__defineGetter__("info", function(){return info});
	this.__defineSetter__("info", function(newInfo){
		//console.log('info set in mediaFile.');
        info = newInfo;
        infoState = 1;
    });

	//save the info for this Media File
	var save = this.save = function(){
		var p = new Promisse();

		//console.log('mediaFile.save() - infoState: ' + infoState);

		if(infoState === 1){
			
			var infoFilePath = getInfoFilePath();

			//save the info to the disk
			fs.writeFile(infoFilePath, JSON.stringify(info), function (err) {
		  		if (err) {
		  			p.reject({
		  				code:ERROR_SAVING_INFO, 
		  				message:"problems trying to save info file.", 
		  				cause:err, 
		  				infoFilePath:infoFilePath
		  			});
		  		}
		  		else{
		  			//console.log('info file saved on: ' + infoFilePath);
		  			p.resolve();//info saved succesfully
		  		}
			});
		}
		return p;
	};

	var getInfoFilePath = this.getInfoFilePath = function(){
		//infoFileName
		var infoFileName = fileName.replace('.' + ext, '.info');
		
		//path for info file
		var path = pathLib.resolve(mediaFolder.path, infoFileName);

		return path;
	};

	var loadInfoFile = this.loadInfoFile = function(){
		var p = new Promisse();

		var path = getInfoFilePath(fileName, mediaFolder, ext);

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
				//console.log('could not parse the info file: ' + err);
				p.reject({code:ERROR_INFO_CANT_PARSE, cause:err});
				return;
			}
		});
		return p;
	};

};

/////////////////////////////////////////
// Static Methods //
/////////////////////////////////////////

//get the extension for a fiven fileName
var getExt = MediaFile.getExt = function(fileName){
	return fileName.substring(fileName.lastIndexOf('.') + 1, fileName.lenght);
};

//get the media file for a given file location
var get = MediaFile.get = function(fileName, mediaFolder, stats){
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
	var ext = getExt(fileName);
	
	switch(ext){
		case 'avi':
		case 'mkv':
		case 'mp4':
			//get media info
			return loadMediaFile(path, fileName, mediaFolder, ext, stats);
			break;
		default:
			console.log('file ext not supported : ' + ext);
			return new Promisse().reject('File is not a valid media file. ext: ' + ext);
			break;
	}
};

//load the Media File details from the file system
var loadMediaFile = MediaFile.loadMediaFile = function(path, fileName, mediaFolder, ext, stats){
	var mediaFile = mediaInfoCache[path];

	var myPromisse = new Promisse();

	if(mediaFile != null){ //media in cache
		myPromisse.resolve(mediaFile);
	}
	else{

		mediaFile = new MediaFile(fileName, mediaFolder, ext);

		//add to the cache
		mediaInfoCache[path] = mediaFile;

		//no media in cache
		//1: try to load the info file
		mediaFile.loadInfoFile()
			.done(function(info){
				//Condition 1: info loaded (unit tested !)
				mediaFile.info = info;
				myPromisse.resolve(mediaFile);
			})
			.fail(function(err){
				//failed to load the info file
				//check error code
				if(err.code === ERROR_INFO_CANT_OPEN || err.code === ERROR_INFO_CANT_PARSE){
					console.log('info not found, or could not be opened - scrape from the internet!');
					
					//Condition 2: info scraped
					MediaScraper.scrape(mediaFile)
						.done(function(info){
							//media details was found by the scrapers and the info object is returned
							mediaFile.info = info;
							mediaFile.save()
								.done(function(){
									myPromisse.resolve(mediaFile);
								})
								.fail(function(err){
									//error when saving media info details
									myPromisse.reject(err);
								});
						})
						.fail(function(err){
							//fail on scraping
							myPromisse.reject(err);
						});
				}
			});
	}
	return myPromisse;
};


//constants
//error codes
var ERROR_INFO_CANT_OPEN 	= MediaFile.ERROR_INFO_CANT_OPEN 			= 1001;
var ERROR_INFO_CANT_PARSE 	= MediaFile.ERROR_INFO_CANT_PARSE 			= 1002;
var ERROR_SAVING_INFO 		= MediaFile.ERROR_SAVING_INFO 				= 1003;
var ERROR_FILENAME_REQUIRED 	= MediaFile.ERROR_FILENAME_REQUIRED 	= 1004;
var ERROR_MEDIAFOLDER_REQUIRED 	= MediaFile.ERROR_MEDIAFOLDER_REQUIRED 	= 1005;


