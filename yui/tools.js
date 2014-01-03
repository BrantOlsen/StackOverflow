var mysql = require('mysql');

/**
 * Create a database connection.
 */
exports.connect_to_database = function() {
    var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'nodejsadmin',
        password : 'makingthemoney',
        database : 'nodejs'
      });

      return connection;
};

/**
 * Print the high scores as JSON.
 */
exports.print_scores = function(response) {
    var connection = this.connect_to_database();
    
    connection.connect();

    connection.query('SELECT * FROM highscores', function(err, rows, fields) {
        if (err) throw err;

        response.writeHead(200, {'Content-Type': 'application/json'});
        console.log("Print scores: " + JSON.stringify(rows));
        response.write(JSON.stringify(rows));
        
        response.end();
    });
    
    connection.end();
};
