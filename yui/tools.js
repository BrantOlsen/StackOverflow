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
}

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
}

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
}

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
}

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
}

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
}