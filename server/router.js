
//Definition of the Router object
function Router(handlers){
	function route(action, response, post){
		console.log("About to route a request for " + action);
		if (typeof handlers[action] === 'function') {
		    
		    handlers[action](response, post);

		} 
		else {
			console.log("No request handler found for " + action);
			
			response.writeHead(404, {"Content-Type": "text/plain"});
		    
		    response.write("404 Not found");
		    
		    response.end();
		}
	}
	this.route = route;
}

//create a router passing a handlers object as parameter
function createRouter(handlers){
	return new Router(handlers);	
}

exports.createRouter = createRouter;