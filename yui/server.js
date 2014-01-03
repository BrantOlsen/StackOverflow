// Including libraries
var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    staticModule = require('node-static');
    
// Static File Server
var fileServer = new staticModule.Server('./');

var tools = require('./tools.js');
var conn = tools.connect_to_database();
conn.connect();

// Web Server
app.listen(3080);
 
// HTTP Server Handler
function handler (request, response) {
    request.addListener('end', function () {
    	// Return Static File
        fileServer.serve(request, response);
    });
};

// Delete this row if you want to see debug messages
io.set('log level', 1);
