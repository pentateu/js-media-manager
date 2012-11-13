var Promisse 	= require('./promisse');
var Util 		= require('./util');

var MediaScraper = module.exports = function( ) {
	//make sure it behaves as a constructor
	if ( ! (this instanceof MediaScraper) ) {
		return new MediaScraper( );
	}


};

//return a list of title options for a given media file
var getListOfTitles = MediaScraper.getListOfTitles = function(mediaFile){

	var list = new Array();
	Util.asCollection(list);

	list.add(mediaFile.fileName);

	return list;
}

//return a list of scraper objects
var getListOfScrapers = MediaScraper.getListOfScrapers = function(){

	var list = new Array();
	Util.asCollection(list);

	list.add(require('./imdbScraper'));

	return list;
}

//scrape method.
//for a given media file it will search on the internet
var scrape = MediaScraper.scrape = function(mediaFile){

	//TODO: check if there is a scraper for this media file already running

	var p = new Promisse();

	//1: get a list of possible search names
	getListOfTitles(mediaFile).iterate(function(it1, title){
		console.log('scrape media for title: ' + title);
		//for each title search on the internet
		//2: get a list of scrapers
		getListOfScrapers().iterate(function(it2, ScraperClass){
			//3: scrape
			var scraper = new ScraperClass(title);
			scraper.search()
				.done(function(info){
					//some info has been returned.. so stops here
					p.resolve(info);
				})
				.fail(function(){
					it2.next();//stage the iterator to the next item
				});
		},
		function(){//called when the iterator of scrapers reachers an end
			it1.next();
		});
	},
	function(){//called when the iterator of titles reachers an end
		//if it is still pending, it means that the scrapers have not manage to find anything
		if(p.state === Promisse.PENDING){
			p.reject("Media details not found.");
		}
	});

	return p;
};