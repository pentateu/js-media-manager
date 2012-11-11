

var server = require("./mediaserver");

var router = require("./router").createRouter(require("./controllers"));

server.start(router);