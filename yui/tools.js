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


