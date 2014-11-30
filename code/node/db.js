var config = require('./config');
var winston = require("winston");
var mysql = require('mysql');

var connections = {
    "default": {
        connection: null,
        parameters: {
            host: config.dbHost,
            database : config.dbName,
            user : config.dbUser,
            password: config.dbPassword
        }
    },
    "root": {
        connection: null,
        parameters: {
            host: config.dbHost,
            user : "root",
            password: config.dbRootPassword
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

var queryDefault = function () {
    var connection = getConnection("default");
    return connection.query.apply(connection, arguments);
};
var escapeDefault = function () {
    var connection = getConnection("default");
    return connection.escape.apply(connection, arguments);
};
module.exports = {
    query: queryDefault,
    escape: escapeDefault,
    getConnection: getConnection
};
