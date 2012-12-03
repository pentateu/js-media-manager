var JSii = require('./jsii/JSii');
var util = require("./util");
var MediaFile = require('./mediaFile');

//MediaStore object is hidden and not exposed to outside the module
var MediaStore = function () {
	//make sure it behaves as a constructor
	if ( ! (this instanceof MediaStore) ) {
		return new MediaStore();
	}
	
	var index = new JSii();
	var storeByPath = {};
	
	function setup (){
		//fields to index
		index.fields.title = 'text';
		index.fields.year = 'string';
		
		index.idField = 'path';
		
		//field to search
		index.defaultSearchField = 'title';
	}
	setup();
	
	this.add = function (mediaFile){
		index.feedDocs([mediaFile]);
		storeByPath[mediaFile.path] = mediaFile;

		//register an event , so when some properties are changed in the mediaFile object the index is also updated
		mediaFile.on(MediaFile.CHANGED_EVENT, function(mediaFile, changes){	
			index.feedDocs([mediaFile]);
		});

		return mediaFile;
	};
	
	this.search = function(term){
		return index.search(term);
	};
	
	this.findByPath = function(path){
		return storeByPath[path];
	};
	
	this.clear = function(){
		index = new JSii();
		setup();
		storeByPath = {};	
	};
};

//check if the global cache exists
if( ! global.__MediaStoreInstance){
	global.__MediaStoreInstance = new MediaStore();
}
var instance = global.__MediaStoreInstance;
//exposed only the singleton instance
module.exports = instance;