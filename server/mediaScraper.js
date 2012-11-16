var Promisse 	= require('./promisse');
var Util 		= require('./util');

//scrapers list
var scraperList = new Array();
Util.asCollection(scraperList);

//add scrapers to the list
//scraperList.add(require('./Scrapers/imdbScraper'));
scraperList.add(require('./Scrapers/imdbOrgScraper'));

//Media Scraper Object definition
var MediaScraper = module.exports = function(mediaFile) {
	//make sure it behaves as a constructor
	if ( ! (this instanceof MediaScraper) ) {
		return new MediaScraper( );
	}

	//scrape method.
	//for a given media file it will search on the internet
	var scrape = this.scrape = function(){
		var p = new Promisse();

		//for each title search on the internet
		//2: get a list of scrapers
		scraperList.iterate(function(it, scraper){
			//3: scrape
			scraper.mediaFile = mediaFile;
			scraper.search()
				.done(function(info){
					//some info has been returned.. so stops here
					p.resolve(info);
				})
				.fail(function(){
					it.next();//stage the iterator to the next item
				});
		},
		function(){//called when the iterator of scrapers reachers an end
			p.reject();//could not find anything
		});
		return p;
	};
};

//expose the scraperList
MediaScraper.scraperList = scraperList;