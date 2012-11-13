var mediaFolder = require('./mediaFolder');
var promisse = require("./promisse");

var searchFolders = [
	{path:'/Volumes/BOOTCAMP/Users/rafael/Documents/media_test_folders/My Movie Archive', type:'movies'},
	{path:'/Volumes/BOOTCAMP/Users/rafael/Documents/media_test_folders/New Movies', type:'movies'}
];

//Media List object
var MediaList = function(){
	var mediaItems = new Array();

	//add a mediaInfo to the list
	this.add = function(mediaInfo){
		mediaItems.push(mediaInfo);
	};

	//return the size of the media list
	this.size = function(){
		return mediaItems.length;
	};

	this.mediaItems = mediaItems;
};

//list all media available in the server
function listAll(){

	var mediaList = new MediaList();

	var myPromisse = promisse.newPromisse().filterChain(function(results){
		return mediaList;//return the mediaList
	});

	//var pending = folders.length;
	for (var i = 0; i < searchFolders.length; i++){
		var folderInfo = searchFolders[i];

		myPromisse.chain(
			mediaFolder.readDir(mediaList, folderInfo)
		);
	}
	return myPromisse;
}

exports.listAll = listAll;