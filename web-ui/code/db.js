var config = require('./config');
var mysql = require('mysql');
var _ = require("lodash");
var mysql = require('mysql');
var config = require('./config');

var connection;
function getConnection(callback) {
    callback = callback || function () {};
    var dbService = config.getJson('/services/db');
    if (!dbService) {
        console.error("db service not up");
        return callback(new Error("db service is not up"));
    }
    var parameters = {
        host: dbService.host,
        port: dbService.port,
        user: dbService.user,
        password: dbService.password,
        database: 'lendsnap'
    };
    if (connection) {
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
