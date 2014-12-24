var config = require('./config');
var mysql = require('mysql');
var _ = require("lodash");


var dbReadyFlag = false;
var dbReadyCallbacks = [];
function dbReady(callback) {
    if (callback === undefined) {
        dbReadyFlag = true;
    } else {
        dbReadyCallbacks.push(callback);
    }
    if (!dbReadyFlag) {
        return;
    }
    var iterCallback;
    while ((iterCallback = dbReadyCallbacks.shift())) {
        iterCallback();
    }
}
function checkDbReady() {
    if (config.serviceRegister.getService("db")) {
        return dbReady();
    }
    setTimeout(checkDbReady, 100);
}
checkDbReady();


var connections = {
    "default": null,
    "root": null
};

var getParameters = function (connectionName) {
    var dbService = config.serviceRegister.getService("db") || {};
    var defaultParameters = {
        host: dbService.host,
        database : dbService.name,
        user : dbService.user,
        password: dbService.password
    };
    var rootParameters = {
        host: dbService.host,
        user : 'root',
        password: dbService.root_password
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
    dbReady(function () {
        callback = callback || function () {};
        //console.log("getConnection", connectionName);
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
        //console.log("connection parameters", parameters);
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
