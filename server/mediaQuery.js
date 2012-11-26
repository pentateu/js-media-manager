var MediaFolder = require('./mediaFolder');
var Promisse = require("./promisse");
var Util = require("./util");

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
	
	p.resolve();
	
	return p;
}

exports.listAll = listAll;