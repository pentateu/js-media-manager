//controllers mapping
var mediaQuery = require("./mediaQuery");

function respond (response, result){
	var body = JSON.stringify(response);
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
exports.listAllMedia = function (response, post){
	mediaQuery.search("*")
		.done(function(list){
			respond(response, list);
		})
		.fail(function(err){
			handleError(response, err);
		});
}

exports.searchMedia = function (response, post){
	mediaQuery.search(post.searchQuery)
		.done(function(list){
			respond(response, list);
		})
		.fail(function(err){
			handleError(response, err);
		});
}