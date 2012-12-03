var fs 				= require('fs'); 
var pathLib 		= require('path');
var events 			= require("events");
var EventEmitter 	= events.EventEmitter;

var util 			= require('./util');
var MediaFile 		= require('./mediaFile');
var Promisse 		= require("./promisse");

//check if the global cache exists
if(!global.__MediaFolderCache){
	global.__MediaFolderCache = {};
}

var mediaFolderCache = global.__MediaFolderCache;

function removeFromCache(path){
	delete mediaFolderCache[path];
}

//exposed only the factory object
var Factory = module.exports = {
	get: function (folderInfo) {
		//check for cached version
		if(mediaFolderCache[folderInfo.path]){
			return mediaFolderCache[folderInfo.path];
		}
		else{
			//create a new MediaFolder
			var newMediaFolder = mediaFolderCache[folderInfo.path] = new MediaFolder(folderInfo);//add to the cache
			return newMediaFolder;
		}
	},
	clearCache: function (){
		mediaFolderCache = global.__MediaFolderCache = {};
	}
};

//events
var STATE_CHANGE_EVENT 		= module.exports.STATE_CHANGE_EVENT  	= "stateChange";
var UPDATE_EVENT 			= module.exports.UPDATE_EVENT  			= "update";
var UPDATE_COMPLETE_EVENT 	= module.exports.UPDATE_COMPLETE_EVENT  = "updateComplete";
var FILES_ADDED_EVENT 		= module.exports.FILES_ADDED_EVENT  	= "newFilesAdded";

//status
var UP_TO_DATE 	= module.exports.UP_TO_DATE 	= "up-to-date";
var UPDATING 	= module.exports.UPDATING 		= "updating";
var INVALID 	= module.exports.INVALID 		= "invalid";

//MediaFolder object is hidden and not exposed to outside the module
var MediaFolder = function(folderInfo) {
	//make sure it behaves as a constructor
	if ( ! (this instanceof MediaFolder) ) {
		return new MediaFolder(folderInfo);
	}

	//setup EventEmmiter
	EventEmitter.call(this);

	var mediaFolder = this;
	var parent 		= this.parent 	= folderInfo.parent;
	var path 		= this.path 	= folderInfo.path;

	////util.debug('MediaFolder created for path:' + path + ' parent: ' + parent);

	//list of mediaFiles found in this folder
	var mediaFileList = util.asCollection(new Array());
	this.__defineGetter__("mediaFileList", function(){return mediaFileList});//mediaFileList is a read only property

	var subFolders = util.asCollection(new Array());
	this.__defineGetter__("subFolders", function(){return subFolders});//subFolders is a read only property

	//use to map the mediaFile by file name
	var mediaFileMap = {};
	var subFoldersMap = {};

	//hold the state of the media folder
	var state = UP_TO_DATE; //initial value
	this.__defineGetter__("state", function(){return state});//state is a read only property

	//check if the folder is valid
	fs.stat(path, function(err, stats){
		if( ! stats.isDirectory() || err){
			//INVALID
			setState(INVALID);
			if(err){
				util.error(err);
			}
		}
	});

	function setState(newState){
		state = newState;
		mediaFolder.emit(STATE_CHANGE_EVENT, newState);
	}

	//add files to this folder
	this.addFiles = function(files){
		var p = new Promisse();

		if(files.size() == 0){
			//no folders to process
			p.resolve();
			return p;
		}
		//list of files added, it is used to pass in the event as a parameter
		var mediaFilesAdded = util.asCollection(new Array());
		
		//go through each of the files to be added
		files.iterate(function(it, item){
			//ask the MediaFile object to get the details
			MediaFile.get(item.fileName, mediaFolder, item.stats)
				.done(function(mediaFile){
					//add the media file to the media list
					mediaFilesAdded.add(mediaFile);
					mediaFileList.add(mediaFile);

					it.next();
				})
				.fail(function(err){
					//could not find media info for the file
					//console.log('Not a valid media file : ' + fullPath);
					it.next();
				});
		},
		function(){
			//util.debug('all files added for path:' + path);
			mediaFolder.emit(FILES_ADDED_EVENT, mediaFilesAdded);
			p.resolve(mediaFilesAdded);
		});
		return p;
	};

	this.addSubFolderFiles = function(folders){
		var p = new Promisse();
		if(folders.size() == 0){
			//util.debug('addSubFolderFiles() no sub folders to add');
			//no folders to process
			p.resolve();
			return p;
		}

		folders.iterate(function(it, item){
			//get the subFolder
			subFolders.add(Factory.get({path:pathLib.resolve(path, item.folderName), parent:mediaFolder}));
			it.next();
		},
		function(){
			//update all sub folders
			subFolders.iterate(function(it, item){
				//util.debug('updating subfolder path:' + item.path);
				p.chain(item.update());
				it.next();
			},
			function(){
				p.resolve();
			});
		});
		return p;
	};

	this.reconcile = function(allFiles){
		var p = new Promisse();
		

		if(allFiles.size() == 0){
			//util.debug('reconcile() no files/folders to reconcile');
			p.resolve();
			return p;
		}

		var mediaFilesNotFound = util.asCollection(new Array());
		var subFoldersNotFound = util.asCollection(new Array());

		//go through all mediaFiles and check which ones no longer exists
		mediaFileList.forEach(function(mediaFileItem, idx){
			var found = false;
			allFiles.forEach(function(fileItem){
				if(mediaFileItem.fileName === fileItem){
					found = true;
					return false;//stop for each
				}
			});
			if( ! found){
				mediaFilesNotFound.add({mediaFile:mediaFileItem, index:idx});
			}
		});

		//go through all subfolders and check which ones no longer exists
		subFolders.forEach(function(subFolderItem, idx){
			var found = false;
			allFiles.forEach(function(fileItem){
				var itemFullPath = pathLib.resolve(path, fileItem);

				if(subFolderItem.path === itemFullPath){
					found = true;
					return false;//stop for each
				}
			});
			if( ! found){
				subFoldersNotFound.add({subFolder:subFolderItem, index:idx});
			}
		});

		//reconcile media files
		var diff = 0;
		mediaFilesNotFound.forEach(function(item){
			var mediaFile = item.mediaFile;
			var idx = item.index;

			//remove form local list
			mediaFileList.splice((idx - diff), 1);
			diff++;

			//TODO:Set he mediaFile as invalid, si nce the file no longer exists
		});

		diff = 0;
		//reconcile sub folders
		subFoldersNotFound.forEach(function(item){
			var subFolder = item.subFolder;
			var idx = item.index;

			//remove from local list
			subFolders.splice((idx - diff), 1);
			diff++;

			//remove subfolder form cache
			removeFromCache(subFolder.path);
		});

		p.resolve();

		return p;
	};

	this.processFiles = function(files){
		var p = new Promisse();

		if(files.length == 0){
			p.resolve();
			return p;
		}

		//util.debug('running processFiles() for path: ' + path);

		var filesFound		= util.asCollection(new Array());
		var subFoldersFound = util.asCollection(new Array());

		//record all items found (files and folders) to reconcile and remove those that no longer exist
		var allFound = util.asCollection(new Array());

		//check each item
		files.forEach(function(file){
			//ful path
			var fullPath = pathLib.resolve(path, file);
			////util.debug('processFiles() fullPath: ' + fullPath);
			try{
				//check if its a file or folder
				var stats = fs.statSync(fullPath);
				//check if it is a file
				if(stats.isFile()){
					allFound.add(file);
					//check if this file is already loaded into this folder
					if( ! mediaFileMap[fullPath]){
						mediaFileMap[fullPath] = true;
						filesFound.add({fileName:file, stats:stats});
					}
				}
				else if(stats.isDirectory()){
					allFound.add(file);
					if( ! subFoldersMap[fullPath]){
						subFoldersMap[fullPath] = true;
						subFoldersFound.add({folderName:file, stats:stats});
					}
				}
				else{
					//file type not supported
					util.warn('[MediaFolder] (WARNING) File stat not supported: ' + fullPath);
				}
			}
			catch(e){
				util.warn('[MediaFolder] (WARNING) Error checking file/folder: ' + fullPath + ' err: ' + util.inspect(e) + '\n(processFiles) for folder: ' + path);
			}
		});

		//util.debug('process filesFound : ' + filesFound.size() + ' subfolders found: ' + subFoldersFound.size());
		//1 process the files found
		p.chain(mediaFolder.addFiles(filesFound));
		//2 process the subfolders
		p.chain(mediaFolder.addSubFolderFiles(subFoldersFound));
		//3: reconcile and remove items that no longer exists
		p.chain(mediaFolder.reconcile(allFound));
		
		p.resolve();
		
		return p;
	};

	//update the folder contents
	//look for subfolders, more mediaFiles and etc
	this.update = function(){
		if(state === UPDATING || state === INVALID){
			//util.debug('folder already updating!');
			return;
		}
		//set the status
		state = UPDATING;
		
		//util.debug('mediaFolder.update() for path:' + path);
		
		var p = new Promisse();		
		
		//1: look for files and subfolders
		fs.readdir(path, function(err, files){
			//check for errors
			if (err){
				console.log('Error on fs.readdir() for path : ' + path + ' err: ' + util.inspect(err));
				setState(INVALID);
				p.reject(err);
			}
			else{
				//util.debug('fs.readdir() for path:' + path);
				mediaFolder.processFiles(files)
					.done(function(){
						//util.debug('UPDATE_COMPLETE_EVENT for path:' + path);
						//when all 3 steps are completed
						setState(UP_TO_DATE);
						mediaFolder.emit(UPDATE_COMPLETE_EVENT, mediaFolder);
						p.resolve();
					});

				//fire an event
				mediaFolder.emit(UPDATE_EVENT, mediaFolder);
			}
		});
		return p;
	};
};

util.inherits(MediaFolder, EventEmitter);