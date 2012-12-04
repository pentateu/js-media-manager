var HTTPServer = require("./HTTPServer");
var MediaFolder = require('./mediaFolder');
var controllers = require("./controllers");

var searchFolders = [
	{path:'C:\\Users\\almeiraf\\Documents\\GitHub\\js-media-manager\\media_test_folders\\My Movie Archive', type:'movies'},
	{path:'C:\\Users\\almeiraf\\Documents\\GitHub\\js-media-manager\\media_test_folders\\New Movies', type:'movies'}
 ];

//Router object definition
var Router = module.exports = function (handlers) {
	//make sure it behaves as a constructor
	if ( ! (this instanceof Router) ) {
		return new Router(handlers);
	}

	this.route = function (action, response, query, post){
		console.log("About to route a request for " + action);
		if (typeof handlers[action] === 'function') {
		    
		    handlers[action](response, query, post);

		} 
		else {
			console.log("No request handler found for " + action);
			
			response.writeHead(404, {"Content-Type": "text/plain"});
		    
		    response.write("404 Not found");
		    
		    response.end();
		}
	};
};

//starts to scan the folders
for (var i = 0; i < searchFolders.length; i++){
	var folderInfo = searchFolders[i];
	var mediaFolder = MediaFolder.get(folderInfo);
	mediaFolder.update();
}

//create a server instance
var server = new HTTPServer({
	tcpPort: 9090, 
	router: new Router(controllers)
});

//start the server
server.start();