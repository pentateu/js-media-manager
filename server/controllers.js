//controllers mapping
var mediaQuery = require("./mediaQuery");
var util = require('./util');

function respond (response, result){
	var body = JSON.stringify(result);
	response.writeHead(200, {"Content-Type": "application/json"});
    response.write(body);
    response.end();
}

function handleError (response, err){
	response.writeHead(500, {"Content-Type": "text/plain"});
	response.write("The following unexpected error occurred : " + err);
    response.end();
}

//List all Media
exports.listAllMedia = function (response, query, post){
	mediaQuery.search("*")
		.done(function(list){
			respond(response, list);
		})
		.fail(function(err){
			handleError(response, err);
		});
}

exports.searchMedia = function (response, query, post){
	//validate parameters
	if(!query.searchQuery){
		handleError(response, exports.SEARCH_QUERY_PARAM_MISSING.error());
	}

	mediaQuery.search(query.searchQuery)
		.done(function(list){
			respond(response, list);
		})
		.fail(function(err){
			handleError(response, err);
		});
}

exports.SEARCH_QUERY_PARAM_MISSING = util.exception({message:"The parameter searchQuery is missing in the query string."});