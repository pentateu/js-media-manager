//var mediaFolder = require('./mediaFolder');
var Promisse = require("./promisse");
var util = require("./util");

var mediaStore = require('./mediaStore');

//list all media available in the server
function search(query){
	var p = new Promisse();

	var searchResults = mediaStore.search(query);
	util.asCollection(searchResults.docs);

	var resultList = util.collection([]);

	//copy list of docs
	resultList.copy(searchResults.docs, function(doc){
		//copy handler
		return {
			title : doc.title,
			year  : doc.year,
			path  : doc.path,
			info  : doc.info
		};
	});

	p.resolve({
		total:searchResults.total,
		pageSize:searchResults.docs.length,
		list:resultList
	});
	return p;
}

exports.listAll = listAll;