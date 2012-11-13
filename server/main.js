var MediaServer = require("./mediaserver");

var router = require("./router").createRouter(require("./controllers"));


var server = new MediaServer({router:router});

server.start(router);
