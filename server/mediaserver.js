
var http = require("http");
var url = require("url");

//Media Server object definition
var MediaServer = module.exports = function(options) {
	//make sure it behaves as a constructor
	if ( ! (this instanceof MediaServer) ) {
		return new MediaServer(options);
	}

	var router = options.router;
	var tcpPort = options.tcpPort;
	if( ! tcpPort){
		tcpPort = 8888;
	}

	var start = this.start = function(){

		function onRequest(request, response) {
			var action = url.parse(request.url).pathname;
			//remove the / from the action name
			action = action.substring(1, action.length);

	    	console.log("Request for action: " + action + " received.");

	    	request.setEncoding("utf8");

	    	var postData = "";
		    request.addListener("data", function(postDataChunk) {
		      postData += postDataChunk;
		      //console.log("Received POST data chunk '" + postDataChunk + "'.");
		    });

		    request.addListener("end", function() {
		      router.route(action, response, postData);
		    });
		}

		http.createServer(onRequest).listen(tcpPort);

		console.log("Media Server has started to listen on port: " + tcpPort);
	}
};