var async = require("async");
var chalk = require("chalk");
var path = require("path");
var config = require('./config');
var helper = require('./helper');
var db = require('./db');
var dbHelper = require('./db-helper');

module.exports = function (options, next) {
    if (next === undefined) {
        options = {};
        next = options;
    }
    options = options || {};

    var allQueries = {
        destroy: [],
        create: [],
        baseData: []
    };

    var _existingTables;
    var _gettingExistingTables;
    var getExistingTables = function (callback) {
        if (_existingTables) {
            return callback(null, _existingTables);
        }
        if (_gettingExistingTables) {
            setTimeout(function () {
                getExistingTables(callback);
            }, 10);
        }
        _gettingExistingTables = true;
        dbHelper.getExistingTables(function (error, existingTables) {
            if (error) {
                return callback(error);
            }
            _existingTables = existingTables;
            setTimeout(function () {
                _gettingExistingTables = false;
                getExistingTables(callback);
            },1);
        });
    };

    var registerDestroyQuery = function (tableName, dbQueries, callback) {
        getExistingTables(function (error, existingTables) {
            console.log(chalk.yellow("....get existing"));
            if (error) {
                return callback(error);
            }
            var query;
            if (existingTables.indexOf(tableName) > -1) {
                query = "DROP TABLE " + tableName;
            }
            allQueries.destroy.push(query);
            callback(null, query);
        });
    };

    var registerQuery = function (queryType, tableName, dbQueries, callback) {
        console.log(chalk.yellow(".." + queryType));
        var args = Array.prototype.slice.call(arguments);
        if (queryType == "destroy") {
            registerDestroyQuery(tableName, dbQueries, callback);
        } else {
            var query = dbQueries[queryType];
            allQueries[queryType].push(query);
            callback(null, query);    
        }
    };

    var getRegisterQueryFunction = function (queryType, tableName, dbQueries) {
        return function (callback) {
            registerQuery(queryType, tableName, dbQueries, callback);
        };
    };


    var noop = function () {
        console.log(chalk.yellow("..noop"));
        var callback = arguments[arguments.length - 1];
        callback(null);
    };

    var getRegisterQueriesFunction = function (tableName, dbQueries) {
        return function (callback) {
            console.log(chalk.yellow("register queries for " + tableName));

            var series = [];
            if (options.destroy) {
                series.push(
                    getRegisterQueryFunction("destroy", tableName, dbQueries));
            }
            series.push(getRegisterQueryFunction("create", tableName, dbQueries));
            if (options.baseData) {
                series.push(
                    getRegisterQueryFunction("baseData",tableName, dbQueries));
            }

            async.series(series, callback);
        };
    };

    var getRegisterQueriesForModuleFunction = function (moduleName, dbSetupModule) {
        return function (callback) {
            console.log(chalk.blue("..register queries for module " + moduleName));
            var registerQueriesFunctions = [];
            for (var tableName in dbSetupModule) {
                if (dbSetupModule.hasOwnProperty(tableName)) {
                    registerQueriesFunctions.push(
                        getRegisterQueriesFunction(tableName, dbSetupModule[tableName]));
                }
            }
            console.log(chalk.blue("....register all queries"));
            async.series(registerQueriesFunctions, function (error) {
                console.log(chalk.blue("......series done."));
                if (error) {
                    return callback(error);
                }
                callback();
            });
        };
    };

    var registerQueriesForModuleFunctions = [];
    helper.getModules().forEach(function (moduleName) {
        var modulePath = path.join(__dirname, moduleName, 'db-setup');
        try {
            console.log(chalk.green(""));
            registerQueriesForModuleFunctions.push(
                getRegisterQueriesForModuleFunction(moduleName, require(modulePath))
            );
        } catch (e) {
            if (e.code != "MODULE_NOT_FOUND") {
                throw e;
            } else {
                console.error(modulePath + ' NOT FOUND');
            }
        }
    });

    var getQueryFunctionFromQuery = function (query) {
        return function (callback) {
            if (!query) {
                return callback();
            }
            console.log(chalk.blue("..Running query"), query);
            db.query(query, function (queryError, queryResults) {
                console.log(chalk.blue("..finished query"), "error - ", queryError);
                if (queryError) {
                    return callback(queryError);
                }
                callback();
            });
        };
    };

    var initialSetup = function (callback) {
        queries = [
            "CREATE DATABASE IF NOT EXISTS " + config.dbName + ";",
            "GRANT ALL ON " + config.dbName + ".* TO " +
                "'" + config.dbUser + "'@'%' " +
                "IDENTIFIED BY '" + config.dbPassword + "';",
            "FLUSH PRIVILEGES;"
        ];
        var queryFunctions = queries.map(function (queryString) {
                return function (callback) {
                    db.getConnection("root", function (error, connection) {
                        if (error) {
                            return callback(error);
                        }
                        connection.query(queryString, callback);
                    });
                };
            });
        async.series(queryFunctions.concat([
            function (callback) {
                callback(null);
            }]), callback);
    };

    console.log(chalk.green("Setting up database"));
    initialSetup(function (error) {
        if (error) {
            return next(error);
        }
        console.log(chalk.green("Getting queries for all modules"));
        async.series(registerQueriesForModuleFunctions, function (error) {
            console.log(chalk.green("Queries ready"));
            if (error) {
                return next(error);
            }
            queries = [];
            if (options.destroy) {
                queries = queries.concat(allQueries.destroy);
            }
            queries = queries.concat(allQueries.create);
            if (options.baseData) {
                queries = queries.concat(allQueries.baseData);
            }
            async.series(queries.map(getQueryFunctionFromQuery), function (error) {
                if (error) {
                    return next(error);
                }
                console.log(chalk.green("Success"));
                next();
            });
        });
    });


};
