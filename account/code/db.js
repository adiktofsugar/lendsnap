var mysql = require('mysql');
var config = require('./config');

var connection;
function getConnection(callback) {
    callback = callback || function () {};
    config.getJson('/services/db', function (error, dbService) {
        if (error) {
            return callback(error);
        }
        var parameters = {
            host: dbService.host,
            port: dbService.port,
            user: dbService.user,
            password: dbService.password,
            database: 'lendsnap'
        };
        if (connection && connection.error) {
            connection.destroy();
        }
        connection = mysql.createConnection(parameters);
        connection.connect(function (error) {
            if (error) {
                console.error("Db connection error", error);
                connection.error = error;
                connection.destroy();
                return callback(new Error("Db connection error."));
            }
            callback(null, connection);
        });
    });
}

function query () {
    var args = arguments;
    var callback = arguments[arguments.length - 1];
    getConnection(function (error, connection) {
        if (error) {
            return callback(error);
        }
        connection.query.apply(connection, args);
    });
}
module.exports = {
    query: query,
    mysql: mysql,
    getConnection: getConnection
};
