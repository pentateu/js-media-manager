
var http = require("http");
var url = require("url");

function start(router){

	function onRequest(request, response) {

		var action = url.parse(request.url).pathname;
		//remove the / from the action name
		action = action.substring(1, action.length);

    	console.log("Request for action: " + action + " received.");

    	request.setEncoding("utf8");

    	var postData = "";
	    request.addListener("data", function(postDataChunk) {
	      postData += postDataChunk;
	      console.log("Received POST data chunk '" + postDataChunk + "'.");
	    });

	    request.addListener("end", function() {
	      router.route(action, response, postData);
	    });
	}

	http.createServer(onRequest).listen(8888);

	console.log("Media Server has started.");
}

exports.start = start;
