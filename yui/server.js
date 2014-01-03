// Including libraries
var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    staticModule = require('node-static');
var url = require('url');

// Static File Server
var fileServer = new staticModule.Server('./');

var tools = require('./tools.js');

// Web Server
app.listen(3080);

// HTTP Server Handler
function handler (request, response) {
    var url_parts = url.parse(request.url, true);
    var query = url_parts.query;

    request.addListener('end', function () {
        if (request.url.indexOf('yui') < 0) {
            console.log(request.url);
        }
        if (request.url == '/get_collections.php') {
            tools.get_collections(response);
        }
        else if (request.url.indexOf('get_videos') >= 0) {
            console.log("Getting videos for " + query.collection_id);
            tools.get_videos(response, query.collection_id);
        }
        else {
            // Return Static File
            fileServer.serve(request, response);
        }
    });
};

// Delete this row if you want to see debug messages
io.set('log level', 1);
