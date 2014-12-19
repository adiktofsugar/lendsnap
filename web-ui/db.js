var config = require('./config');
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

var getConnection = function (connectionName, callback) {
    var parameters = connections[connectionName].parameters;
    var currentConnection = connections[connectionName].connection;
    if (currentConnection && currentConnection.error) {
        currentConnection.destroy();
        currentConnection = undefined;
    }
    if (!currentConnection) {
        currentConnection = mysql.createConnection(parameters);
    }
    connections[connectionName].connection = currentConnection;
    currentConnection.connect(function (error) {
        if (error) {
            console.error("Mysql connection error - " + error);
            currentConnection.error = error;
            currentConnection.destroy();
            return callback(new Error("Couldnt connect to database."));
        }
        return callback(null, currentConnection);
    });
};

var queryDefault = function () {
    var args = arguments;
    getConnection("default", function (error, connection) {
        if (error) {
            var callback = args[args.length-1];
            return callback(error);
        }
        return connection.query.apply(connection, args);
    });
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
