
var http = require("http");
var url = require("url");

//Media Server object definition
var HTTPServer = module.exports = function(options) {
	//make sure it behaves as a constructor
	if ( ! (this instanceof HTTPServer) ) {
		return new HTTPServer(options);
	}

	var server = this;

	var router = options.router;
	var tcpPort = options.tcpPort;
	if( ! tcpPort){
		tcpPort = 8888;
	}

	server.handleError = function (response, err){
		var message = "Server error : \n" + JSON.stringify(err) + '\n' + err.stack;
		response.writeHead(500, {"Content-Type": "text/plain"});
		response.write(message);
	    response.end();

	    console.log( message )
	};

	server.start = function(){

		var onRequest = function (request, response) {
			var urlObj = url.parse(request.url, true);

			var action = urlObj.pathname;
			//remove the / from the action name
			action = action.substring(1, action.length);

	    	console.log("Request for action: " + action + " received");

	    	request.setEncoding("utf8");

	    	var postData = "";
		    request.addListener("data", function(postDataChunk) {
		      postData += postDataChunk;
		    });

		    request.addListener("end", function() {
		    	try{
					router.route(action, response, urlObj.query, postData);
		    	}
		    	catch(e){
		    		server.handleError(response, e);
		    	}
		    });
		};

		http.createServer(onRequest).listen(tcpPort);

		console.log("Media Server has started to listen on port: " + tcpPort);
	};
};