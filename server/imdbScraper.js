var Promisse 	= require('./promisse');
var Util 		= require('./util');

var IMDBScraper = module.exports = function(title) {
	//make sure it behaves as a constructor
	if ( ! (this instanceof IMDBScraper) ) {
		return new IMDBScraper(title);
	}

	//perform a search
	var search = this.search = function(){
		var p = new Promisse();

		//mock
		p.resolve(
			{
				"title" : "Fake title - from mock imdb scraper",
				"watched" : "false",
				"imdb" : {
					"title" : "Fake title - from mock imdb scraper",
					"year" : "2012",
					"id" : "tt1764651",
					"rating" : "7.1"
				}
			}
		);

		return p;
	};



};