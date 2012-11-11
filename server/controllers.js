//controllers mapping
var mediaQuery = require("./mediaQuery");

function listAllMedia(response, post){

	mediaQuery.listAll(function(list){
		var body = JSON.stringify(list);

		response.writeHead(200, {"Content-Type": "application/json"});
	    
	    response.write(body);
	    
	    response.end();
	});
	
}

//export members of the module
exports.listAllMedia = listAllMedia;