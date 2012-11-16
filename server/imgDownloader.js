//modules
var fs	 	= require('fs'); 
var pathLib = require('path');
var http 	= require('http');


var Promisse 		= require("./promisse");
var Util 			= require('./util');

//local vars
var mediaInfoCache = {};

var ImgDownloader = module.exports = function(url, imgPath) {
	//make sure it behaves as a constructor
	if ( ! (this instanceof ImgDownloader) ) {
		return new ImgDownloader(url, mediaFolder);
	}

	this.download = function(){
		var p = new Promisse();

		http.get(url, function(res){
		    var imagedata = '';
		    res.setEncoding('binary');

		    res.on('data', function(chunk){
		        imagedata += chunk;
		    });

		    res.on('end', function(){
		        fs.writeFile(imgPath, imagedata, 'binary', function(err){
		            if (err) {
		            	p.reject(err);
		            }
		            else{
		            	p.resolve();
		            }
		        })
		    })

		});
		return p;
	};
};