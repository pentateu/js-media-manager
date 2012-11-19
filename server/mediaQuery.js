var MediaFolder = require('./mediaFolder');
var Promisse = require("./promisse");
var Util = require("./util");

var searchFolders = [
	{path:'/Users/rafaelalmeida/Developer/NodeJS/js-media-manager/media_test_folders/My Movie Archive', type:'movies'},
	{path:'/Users/rafaelalmeida/Developer/NodeJS/js-media-manager/media_test_folders/New Movies', type:'movies'}
];

//Media List object
var MediaList = function(){
	var mediaItems = this.mediaItems = new Array();

	Util.asCollection(this, mediaItems);
};

//list all media available in the server
function listAll(){

	//var mediaList = new MediaList();
	var mediaList = new Array();
	Util.asCollection(mediaList);

	var p = new Promisse().filterChain(function(results){
		return mediaList;//return the mediaList
	});

	//var pending = folders.length;
	for (var i = 0; i < searchFolders.length; i++){
		var folderInfo = searchFolders[i];

		var mediaFolder = new MediaFolder(folderInfo);

		p.chain(mediaFolder.scan(mediaList));
	}
	p.resolve();
	return p;
}

exports.listAll = listAll;