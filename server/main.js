var MediaServer = require("./mediaserver");
var MediaFolder = require('./mediaFolder');
var router = require("./router").createRouter(require("./controllers"));

var searchFolders = [
	{path:'/Users/rafaelalmeida/Developer/NodeJS/js-media-manager/media_test_folders/My Movie Archive', type:'movies'},
	{path:'/Users/rafaelalmeida/Developer/NodeJS/js-media-manager/media_test_folders/New Movies', type:'movies'}
 ];

//starts to scan the folders
for (var i = 0; i < searchFolders.length; i++){
	var folderInfo = searchFolders[i];
	var mediaFolder = MediaFolder.get(folderInfo);
	mediaFolder.update();
}

var server = new MediaServer({router:router});
server.start(router);

