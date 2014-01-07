// Including libraries
var express = require('express');
var path = require('path');
var tools = require('./tools.js');
var app = express();
var io = require('socket.io').listen(app);

// Allow POST values to be processed.
app.use(express.bodyParser());

// Handle the routes.
app.get('/get_collections', function(req, res) {
    tools.get_collections(res);
});
app.get('/get_videos', function(req, res) {
    tools.get_videos(res, req.query.collection_id);
});
app.get('/save_collection', function(req, res) {
    tools.get_collection_id(req.query.name, function(collection_id) {
        res.writeHead(200, {'Content-Type': 'application/json'});
        if (collection_id) {
            res.write(JSON.stringify({id: collection_id}));
            res.end();
        }
        else {
            tools.add_collection(req.query.name, function(collection_id) {
                res.write(JSON.stringify({id: collection_id}));
                res.end();
            });
        }
    });
});
app.get('/process_collection', function(req, res) {
    tools.start_process(res, req.query.collection_id);
});
app.get('/get_process_status', function(req, res) {
    tools.get_unique_id_lookup({collection_id: req.query.collection_id}, function(run_for_id) {
        tools.get_process_by_run_for_id(run_for_id, function(process_id, status) {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.write(JSON.stringify(status));
            res.end();
        });
    });
});
app.post('/save_video', function(req, res) {
    var video_name = req.files.Filedata.name;
    var dir_name = req.files.Filedata.path;
    var collection_id = req.body.collection_id;

    tools.get_folder_id(dir_name, function(dir_id) {
        function do_add(dir_id) {
            tools.add_video(video_name, dir_id, collection_id, function(video_id) {
                tools.add_video_collection_item(video_id, collection_id);
            });

            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.write('Upload Success');
            res.end();
        };
        if (dir_id) {
            do_add(dir_id);
        }
        else {
            tools.add_folder(dir_name, function(dir_id) {
                do_add(dir_id);
            });
        }
    });

    // Save File
    //fs.readFile(req.files.displayImage.path, function (err, data) {
        //var newPath = __dirname + "/uploads/uploadedFileName";
        //fs.writeFile(newPath, data, function (err) {
            //res.redirect("back");
        //});
    //});
});

// Serve up static files like .html, .css, and .js.
app.use(express.static(path.join(__dirname, '')));

// Delete this row if you want to see debug messages
io.set('log level', 1);

// Listen on port 3080.
app.listen(3080);