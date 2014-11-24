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

var getConnection = function (connectionName) {
    var parameters = connections[connectionName].parameters;
    if (!connections[connectionName].connection) {
        connections[connectionName].connection = mysql.createConnection(parameters);
    }
    return connections[connectionName].connection;
};

var queryDefault = function (queryString, callback) {
    getConnection("default").query(queryString, callback);
};
module.exports = {
    query: queryDefault,
    getConnection: getConnection
};
