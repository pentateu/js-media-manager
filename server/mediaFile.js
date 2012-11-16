//modules
var fs	 	= require('fs'); 
var pathLib = require('path');

var Promisse 		= require("./promisse");
var Util 			= require('./util');
var MediaScraper 	= require("./mediaScraper");

var ImgDownloader	 = require('./imgDownloader');

//local vars
var mediaInfoCache = {};

var MediaFile = module.exports = function(fileName, mediaFolder, ext) {
	//make sure it behaves as a constructor
	if ( ! (this instanceof MediaFile) ) {
		return new MediaFile(fileName, mediaFolder, ext);
	}

	//validate parameters
	if( ! fileName){
		throw MediaFile.ERROR_FILENAME_REQUIRED;
	}
	if( ! mediaFolder){
		throw MediaFile.ERROR_MEDIAFOLDER_REQUIRED;
	}

	if( ! ext){
		ext = getExt(fileName);
	}

	//constructor
	this.mediaFolder = mediaFolder;
	this.fileName = fileName;
	//title
	this.title = MediaFile.cleanTitle(fileName);
	this.year = MediaFile.getYear(fileName);
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
	this.save = function(){
		var p = new Promisse();

		if(infoState === 1){
			
			var infoFilePath = this.getInfoFilePath();

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

	this.getInfoFilePath = function(){
		//infoFileName
		var infoFileName = fileName.replace('.' + ext, '.info');
		//path for info file
		var path = pathLib.resolve(mediaFolder.path, infoFileName);
		return path;
	};

	this.getPosterFilePath = function(imgExt){
		//infoFileName
		var imgFileName = fileName.replace('.' + ext, '.' + imgExt);
		//path for info file
		var path = pathLib.resolve(mediaFolder.path, imgFileName);
		return path;
	};

	var loadInfoFile = this.loadInfoFile = function(){
		var p = new Promisse();

		var path = this.getInfoFilePath(fileName, mediaFolder, ext);

		//open file
		fs.readFile(path, function(err, data){
			//check for errors
			if (err){
				p.reject(MediaFile.ERROR_INFO_CANT_OPEN.setCause(err));
				return p;
			}

			var info = null;
			//try to parse the content
			try{
				info = JSON.parse(data);
				p.resolve(info);
			}
			catch(err){
				p.reject(MediaFile.ERROR_INFO_CANT_PARSE.setCause(err));
				return p;
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
		//create a mediaFile instance
		mediaFile = new MediaFile(fileName, mediaFolder, ext);

		//add to the cache
		mediaInfoCache[path] = mediaFile;

		function infoLoaded(){
			var imgExt = 'jpg';
			var posterImgPath = mediaFile.getPosterFilePath(imgExt);

			//check if the poster image exists
			fs.exists(posterImgPath, function(exists){
				if(exists){
					mediaFile.posterPath = posterImgPath;
					myPromisse.resolve(mediaFile);
				}
				else if(mediaFile.info && mediaFile.info.imdb && mediaFile.info.imdb.poster){
					//download poster from the internet
					var imgD = MediaFile.getImgDownloader(mediaFile.info.imdb.poster, posterImgPath);
					imgD.download()
						.done(function(){
							mediaFile.posterPath = posterImgPath;
							myPromisse.resolve(mediaFile);
						})
						.fail(function(e){
							//problems downloading image
							console.log('Error downloading poster! : ' + JSON.stringify(e));
							myPromisse.resolve(mediaFile);
						});
				}
				else{
					console.log('(WARNING) There is no poster url in the media info : ' + mediaFile.getInfoFilePath());
					//do nothing since it could not find localy and also not in scraped data.
					myPromisse.resolve(mediaFile);
				}
			});
		}

		//no media in cache
		//1: try to load the info file
		mediaFile.loadInfoFile()
			.done(function(info){
				//Condition 1: info loaded (unit tested !)
				mediaFile.info = info;
				//myPromisse.resolve(mediaFile);
				infoLoaded();
			})
			.fail(function(err){
				//failed to load the info file
				//check error code
				if(err === MediaFile.ERROR_INFO_CANT_OPEN || err === MediaFile.ERROR_INFO_CANT_PARSE){
					console.log('info not found, or could not be opened - scrape from the internet!');
					
					//Condition 2: info scraped
					var mediaScraper = MediaFile.getScraper(mediaFile);
					mediaScraper.scrape()
						.done(function(info){
							//media details was found by the scrapers and the info object is returned
							mediaFile.info = info;
							mediaFile.save()
								.done(function(){
									//myPromisse.resolve(mediaFile);
									infoLoaded();
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

//CleanUp object
var CleanUp = function(opt){
	var regExp = opt.regExp;
	var replacement = opt.replacement;

	this.run = function(value){
		var prevValue = "";
		//run the replacement while the string size remain the same
		while(prevValue !== value){
			try{
				prevValue = value;
				value = value.replace(regExp, replacement);
			}
			catch(e){
				console.log('(Warning) Error when running cleanUp: ' + JSON.stringify(e));
				//ignore replace errors
			}
		}
		return value;
	};
};

var mediaTitleCleanUp = MediaFile.mediaTitleCleanUp = new Array();
Util.asCollection(mediaTitleCleanUp);

//Regular expression to clean-up the file extension
mediaTitleCleanUp.add(new CleanUp({
	regExp:/\.\w{3}$/,
	replacement:''
}));

//Regular expression to clean-up the year from the filename
mediaTitleCleanUp.add(new CleanUp({
	regExp:/(\(\d{4}\)|\.\d{4})/g,
	replacement:''
}));

// file info 
mediaTitleCleanUp.add(new CleanUp({
	regExp:/(2\.Aud)|(AC3)|(5\.1)|(\.JP)|(\.BR)|(])|(2\.Sub)|(\.EN)|(720p)|(720)|(\d{6})|(ddlsource\.com)|(HDrip)|(ViBE)|(extended)|(\.dc)|(bluray)|(dts)|(x264)|(publichd)|(DVDRip)/gi,
	replacement:''
}));

//replace . - _ (double spaces) for spaces
mediaTitleCleanUp.add(new CleanUp({
	regExp:/(-)|(\_)|(\.)|(\s{2})|(\s{3})/g,
	replacement:' '
}));

//remove white space at the begining and at the end of the file name
mediaTitleCleanUp.add(new CleanUp({
	regExp:/(^\s)|(\s$)/g,
	replacement:''
}));

MediaFile.capitalize = function(str)
{
    return str.replace(/\w\S*/g, function(txt){
    	return txt.charAt(0).toUpperCase() + txt.substr(1);
    });
}

//return the media title clean for a given media file
MediaFile.cleanTitle = function(title){
	//clean-up the file name using regular expressions
	mediaTitleCleanUp.forEach(function(cleanUp){
		//replace using the regular expression
		title = cleanUp.run(title);
	});
	return MediaFile.capitalize(title);
};

MediaFile.getScraper = function(mediaFile){
	return new MediaScraper(mediaFile);
};

MediaFile.getImgDownloader = function(imgUrl, imgFilePath){
	return new ImgDownloader(imgUrl, imgFilePath);
};

//clear the cache
MediaFile.clearCache = function(){
	mediaInfoCache = {};	
};

MediaFile.getYear = function(fileName){
	//pattern to find the year in the string
	var pattFind = /\(\d{4}\)|\.\d{4}/;

	//pattern to clean-up the year sonce extracted - remove ( ) and .
	var pattCleanup = /\.|\(|\)/g;

	var result = pattFind.exec(fileName);

	if(result){
		return result.toString().replace(pattCleanup, '');
	}
	else{
		return null;
	}
};

//constants
//error codes
MediaFile.ERROR_INFO_CANT_OPEN 			= Util.exception({message:"Can't Open Info file."});
MediaFile.ERROR_INFO_CANT_PARSE 		= Util.exception({message:"Can't Parse Info file."});
MediaFile.ERROR_SAVING_INFO 			= Util.exception({message:"Can't Save Info file."});
MediaFile.ERROR_FILENAME_REQUIRED 		= Util.exception({message:"fileName is required."});
MediaFile.ERROR_MEDIAFOLDER_REQUIRED 	= Util.exception({message:"mediaFolder is required."});


