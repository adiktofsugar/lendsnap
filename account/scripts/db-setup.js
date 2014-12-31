#!/usr/bin/node
var db = require('../db');
var dbDefinition = require('../db-definition');
var queryBuilder = require('../db-query-builder');
var async = require('async');

var query = function (queryString) {
    return function (callback) {
        console.log(queryString);
        db.query(queryString, callback);
    };
};

var queryFunctions = [];
var tables = dbDefinition.getTables();

Object.keys(tables).forEach(function (tableName) {
    var tableDefinition = tables[tableName];

    var createTableFunction = function (callback) {
        var createTableQueryFunctions = [];
        queryBuilder.getQueriesForTable(tableName, tableDefinition, function (error, tableQueries) {
            if (error) {
                return callback(error);
            }
            console.log("table queries");
            tableQueries.forEach(function (queryString) {
                console.log(queryString);
                createTableQueryFunctions.push(query(queryString));
            });
            console.log("running queries");
            async.series(createTableQueryFunctions, callback);
        });
        
    };
    queryFunctions.push(createTableFunction);
});

async.series(queryFunctions, function (error) {
    if (error) {
        console.error("Error", error);
        process.exit(1);
    } else {
        console.log("Successful");
        process.exit();
    }
});
