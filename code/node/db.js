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

var activeConnection;
var getConnection = function (connectionName) {
    var parameters = connections[connectionName].parameters;
    if (!connections[connectionName].connection) {
        connections[connectionName].connection = mysql.createConnection(parameters);
    }
    activeConnection = connections[connectionName].connection;
    return activeConnection;
};

var queryDefault = function (queryString, callback) {
    getConnection("default").query(queryString, callback);
};
module.exports = {
    query: queryDefault,
    getConnection: getConnection
};
Object.defineProperty(module.exports, "connection", {
    get: function () {
        return activeConnection;
    }
});
Object.defineProperty(module.exports, "escape", {
    get: function () {
        return activeConnection.escape;
    }
});
