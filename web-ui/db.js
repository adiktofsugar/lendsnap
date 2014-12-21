var config = require('./config');
var mysql = require('mysql');
var _ = require("lodash");

var connections = {
    "default": null,
    "root": null
};

var getParameters = function (connectionName) {
    var defaultParameters = {
        host: config.dbHost,
        database : config.dbName,
        user : config.dbUser,
        password: config.dbPassword
    };
    var rootParameters = {
        host: config.dbHost,
        user : 'root',
        password: config.dbRootPassword
    };
    var parametersMap = {
        'default': defaultParameters,
        'root': rootParameters
    };
    if (!parametersMap[connectionName]) {
        throw new Error("No parameters for connection named " + connectionName);
    }
    return parametersMap[connectionName];
};

var getConnection = function (connectionName, callback) {
    callback = callback || function () {};
    console.log("getConnection", connectionName);
    var parameters = getParameters(connectionName);

    var otherConnectionNames = Object.keys(connections).filter(function (openConnectionName) {
        return (openConnectionName != connectionName);
    });
    otherConnectionNames.forEach(function (connectionName) {
        var connection = connections[connectionName];
        if (connection && connection.destroy) {
            console.log("Destroying " + connectionName + " connection");
            connection.destroy();
        }
    });
    var currentConnection = connections[connectionName];
    var lastConnectionErrored = (currentConnection && currentConnection.error);
    if (lastConnectionErrored) {
        currentConnection.destroy();
        currentConnection = undefined;
    }
    console.log("connection parameters", parameters);
    if (!currentConnection) {
        currentConnection = mysql.createConnection(parameters);
        connections[connectionName] = currentConnection;
        currentConnection.connect(function (error) {
            if (error) {
                console.error("Mysql connection error - " + error);
                currentConnection.error = error;
                currentConnection.destroy();
                return callback(new Error("Couldnt connect to database."));
            }
            return callback(null, currentConnection);
        });
    } else {
        return callback(null, currentConnection);
    }
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
    var connection = connections['default'];
    if (!connection) {
        throw new Error("No default connection exists.");
    }
    return connection.escape.apply(connection, arguments);
};
module.exports = {
    query: queryDefault,
    escape: escapeDefault,
    getConnection: getConnection
};
