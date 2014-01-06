var mysql = require('mysql');

/**
 * Create a database connection.
 */
exports.connect_to_database = function() {
    var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : 'makingthemoney',
        database : 'aladdin'
      });

      return connection;
};

exports.get_collections = function(response) {
    var conn = this.connect_to_database();
    conn.connect();

    conn.query('SELECT collection_id, name FROM aladdin.collection', function(err, rows, fields) {
        if (err) throw err;

        response.writeHead(200, {'Content-Type': 'application/json'});
        response.write(JSON.stringify(rows));
        response.end();
    });
    conn.end();
};

/**
 * Find all videos for the given collection id and write them as JSON
 * to the response object.
 */
exports.get_videos = function(response, collection_id) {
    var conn = this.connect_to_database();
    conn.connect();

    var sql = 'SELECT video_file_name FROM aladdin.video v ' +
              'JOIN aladdin.collection_videos cv ON v.video_id = cv.video_id ' +
              'WHERE cv.collection_id = ?';
    var post = [collection_id];

    conn.query(sql, post, function(err, rows, fields) {
        if (err) throw err;

        response.writeHead(200, {'Content-Type': 'application/json'});
        response.write(JSON.stringify(rows));
        response.end();
    });
    conn.end();
};

/**
 * Get a collections id by the given name. Passes the id to the given callback function.
 */
exports.get_collection_id = function(collection_name, callback) {
    var conn = this.connect_to_database();
    conn.connect();

    var sql = 'SELECT collection_id FROM aladdin.collection WHERE name = ?';
    var post = [collection_name];

    conn.query(sql, post, function(err, rows, fields) {
        if (err) throw err;

        if (rows.length > 0) {
            callback(rows[0].collection_id);
        }
        else {
            callback(null);
        }
    });
    conn.end();
};

/**
 * Add a collection with the given name. Passes the collections new id
 * to the callback function.
 */
exports.add_collection = function(collection_name, callback) {
    var conn = this.connect_to_database();
    conn.connect();

    var sql = 'INSERT INTO aladdin.collection (name, created_on, owner_id) VALUES (?, NOW(), ?)';
    var owner_id = 1;
    var post = [collection_name, owner_id];

    conn.query(sql, post, function(err, ress) {
        if (err) throw err;

        callback(ress.insertId);
    });
    conn.end();
};

/**
 * Get the given folder's id by name. Passes the id to the given callback or
 * passes null to the callback if nothing was found.
 */
exports.get_folder_id = function(dir_name, callback) {
    var conn = this.connect_to_database();
    conn.connect();

    var sql = 'SELECT fd_id FROM aladdin.file_directory WHERE directory = ?';
    var post = [dir_name];

    conn.query(sql, post, function(err, rows, fields) {
        if (err) throw err;

        if (callback) {
            if (rows.length > 0) {
                callback(rows[0].fd_id);
            }
            else {
                callback(null);
            }
        }
    });
    conn.end();
};

/**
 * Add the given folder and pass the new id to the callback function.
 */
exports.add_folder = function(dir_name, callback) {
    var conn = this.connect_to_database();
    conn.connect();

    var sql = 'INSERT INTO aladdin.file_directory (directory) VALUES (?)';
    var post = [dir_name];

    conn.query(sql, post, function(err, ress) {
        if (err) throw err;

        if (callback) callback(ress.insertId);
    });
    conn.end();
};

/**
 *
 */
exports.add_video = function(name, dir_id, source_id, callback) {
    var conn = this.connect_to_database();
    conn.connect();

    var sql = 'INSERT INTO aladdin.VIDEO (video_file_name, video_file_directory_id, source_collection_id) ' +
              'VALUES (?, ?, ?)';
    var post = [name, dir_id, source_id];

    conn.query(sql, post, function(err, ress) {
        if (err) throw err;

        if (callback) {
            callback(ress.insertId);
        }
    });
    conn.end();
};

/**
 *
 */
exports.add_video_collection_item = function(video_id, collection_id, callback) {
    var conn = this.connect_to_database();
    conn.connect();

    var sql = 'INSERT INTO aladdin.COLLECTION_VIDEOs (video_id, collection_id) ' +
              'VALUES (?, ?)';
    var post = [video_id, collection_id];

    conn.query(sql, post, function(err, ress) {
        if (err) throw err;

        if (callback) {
            callback(ress.insertId);
        }
    });
    conn.end();
};

/**
 * Add the process job if it has not already been added.
 */
exports.start_process = function(res, collection_id) {
    var self = this;
    var pipeline_id = 1;
    var user_id = 1;
    var status = 1;

    res.writeHead(200, {'Content-Type': 'application/json'});

    function check_and_add_process(unique_id) {
        self.get_process_by_run_for_id(unique_id, function(run_for_id) {
            if (run_for_id) {
                res.write(JSON.stringify(run_for_id));
                res.end();
            }
            else {
                self.add_process(status, unique_id, pipeline_id, user_id, function(id) {
                    res.write(JSON.stringify(id));
                    res.end();
                });
            }
        });
    };

    self.get_unique_id_lookup({collection_id: collection_id}, function(unique_id) {
        if (unique_id) {
            check_and_add_process(unique_id)
        }
        else {
            self.add_unique_id_lookup({collection_id: collection_id}, function(unique_id) {
                check_and_add_process(unique_id);
            });
        }
    });
};

/**
 * Find the unique id for the given collection_id, concept_id, or
 * event_id depending on which value is defined on options. The
 * resulting id is passed to the callback.
 */
exports.get_unique_id_lookup = function(options, callback) {
    var conn = this.connect_to_database();
    conn.connect();

    var sql = 'SELECT dsl_id FROM aladdin.unique_id_lookup WHERE ';
    var post = [];
    if (options.collection_id) {
        sql += 'collection_id = ?';
        post = [options.collection_id];
    }
    else if(options.concept_id) {
        sql += 'concept_id = ?';
        post = [options.concept_id];
    }
    else if(options.event_id) {
        sql += 'event_id = ?';
        post = [options.event_id];
    }
    conn.query(sql, post, function(err, rows, fields) {
        if (err) throw err;

        if (rows.length > 0) {
            callback(rows[0].dsl_id);
        }
        else {
            callback(null);
        }
    });
    conn.end();
};

/**
 * Insert a new unique id for the given collection_id, event_id, or
 * concept_id. The unique id is then passed to the callback if the
 * callback is given.
 */
exports.add_unique_id_lookup = function(options, callback) {
    var conn = this.connect_to_database();
    conn.connect();

    var sql = 'INSERT INTO aladdin.unique_id_lookup(collection_id, event_id, concept_id) ' +
              'VALUES (?, ?, ?)';
    var post = [options.collection_id, options.event_id, options.concept_id];

    conn.query(sql, post, function(err, ress) {
        if (err) throw err;

        if (callback) callback(ress.insertId);
    });
    conn.end();
};

/**
 *
 */
exports.add_process = function(status, run_for_id, pipeline_id, user_id, callback) {
    var conn = this.connect_to_database();
    conn.connect();

    var sql = 'INSERT INTO aladdin.process_job (status, run_for_id, pipeline_id, user_id) ' +
              'VALUES (?, ?, ?, ?)';
    var post = [status, run_for_id, pipeline_id, user_id];

    conn.query(sql, post, function(err, ress) {
        if (err) throw err;

        if (callback) callback(ress.insertId);
    });
    conn.end();
}

/**
 *
 */
exports.get_process_by_run_for_id = function(run_for_id, callback) {
    var conn = this.connect_to_database();
    conn.connect();

    var sql = 'SELECT process_id FROM aladdin.process_job ' +
              'WHERE run_for_id = ?';
    var post = [run_for_id];

    conn.query(sql, post, function(err, rows, fields) {
        if (err) throw err;

        if (rows.length > 0) {
            callback(rows[0].process_id);
        }
        else {
            callback(null);
        }
    });
    conn.end();
}