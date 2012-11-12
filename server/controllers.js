//controllers mapping
var mediaQuery = require("./mediaQuery");

function listAllMedia(response, post){

	mediaQuery.listAll()
		.done(function(list){
			var body = JSON.stringify(list);

			response.writeHead(200, {"Content-Type": "application/json"});
		    
		    response.write(body);
		    
		    response.end();
		})
		.fail(function(err){
			response.writeHead(500, {"Content-Type": "text/plain"});
			    
			response.write("The following unexpected error occurred : " + err);
		    
		    response.end();
		});
}

//export members of the module
exports.listAllMedia = listAllMedia;