var config = require('./config');
var winston = require("winston");

var mysql = require('mysql');

var connections = {
    "default": {
        connection: null,
        parameters: {
            host: config.get('dbHost'),
            database : config.get("dbName"),
            user : config.get("dbUser"),
            password: config.get("dbPassword")
        }
    },
    "root": {
        connection: null,
        parameters: {
            host: config.get('dbHost'),
            user : "root",
            password: config.get("dbRootPassword")
        }
    }
};

var getConnection = function (connectionName, callback) {
    if (!connectionName) {
        callback(new Error("connectionName is required"));
        return;
    }
    if (!connections[connectionName].connection) {
        connections[connectionName].connection = mysql.createConnection(parameters);
    }
    var connection = connections[connectionName].connection;
    connection.connect(function (error) {
        if (error) {
            callback(error);
        } else {
            callback(null, connection);
        }
    });
};

var queryByName = function (name, queryString, callback) {
    getConnection(name, function (error, connection) {
        if (error) {
            callback(error);
        } else {
            connection.query(queryString, callback);
        }
    });
};
module.exports = function (queryString, callback) {
    queryByName("default", queryString, callback);
};
module.exports.queryByName = queryByName;
