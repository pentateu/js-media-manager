var Promisse 	= require('../promisse');
var Util 		= require('../util');
var http		= require('http');
var JSONScraper     = require('./jsonScraper');

var SEARCH_URL = "http://imdbapi.org/?type=json&plot=simple&episode=0&limit=2&mt=none&lang=en-US&offset=";
//&year=2012&yg=1
//with year
//http://imdbapi.org/?q=The+Expendables+2&type=json&plot=simple&episode=0&limit=2&year=2012&yg=1&mt=none&lang=en-US&offset=

//NO year
//http://imdbapi.org/?q=The+Expendables+2&type=json&plot=simple&episode=0&limit=2&yg=0&mt=none&lang=en-US&offset=

var IMDBApiOrgScraper = module.exports = new JSONScraper(function(context) {

	//console.log('IMDBApiOrgScraper constructor - context : ' + JSON.stringify(context));

	//override Scraper/context behaviour
	var superGetQuery = context.getQuery;
	context.getQuery = function(){
		return superGetQuery(false);//does not include the year in the search query, this api has a specific parameter for the year
	};


	//implement context handlers
	this.buildURL = function(query){
		if(context.mediaFile.year){
			return SEARCH_URL + '&q=' + query + '&year=' + context.mediaFile.year + '&yg=1';
		}
		else{
			return SEARCH_URL + '&q=' + query;
		}
	};

	//Function that process the IMDB search result and return a media indo object
	this.processSearchResult = function(jsonResult){

		//check for errors
		if(jsonResult.error){
			throw jsonResult.error;
		}

		var info = {};

		//check how many exact matches
		if(jsonResult.length == 1){
			//only one exact match, so no candidates
			buildInfo(info, jsonResult[0]);
		}
		else{
			//multiple matches
			//turn into a collection
			Util.asCollection(jsonResult);

			var first = true;

			jsonResult.forEach(function(item){
				//for each found
				if( ! first){
					if(item.type === "M"){ //only movies
						if(!info.candidates){
							info.candidates = new Array();
						}
						//from the second - add as candidates
						var candidate = {};
						buildInfo(candidate, item);
						info.candidates.push(candidate);
					}
				}
				else{
					//add the first as the info
					buildInfo(info, item);
					first = false;	
				}
			});
		}
		return info;
	};
	
	var buildInfo = this.buildInfo = function(info, imdbObj){
		//initial default values
		info.watched = false;
		
		info.imdb = imdbObj;
	};	
});