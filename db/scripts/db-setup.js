#!/usr/bin/node
var mysql = require('mysql');
var async = require('async');
var credentals = require('../code/credentials');

var connection = mysql.createConnection({
    user: 'root',
    password: process.env.DB_ENV_MYSQL_ROOT_PASSWORD,
    host: 'db'
});
var query = function (queryString) {
    return function (callback) {
        connection.query(queryString, function (error) {
            callback(error);
        });        
    };
};

connection.connect(function (error) {
    if (error) {
        console.error("Error - couldn't connect", error);
        process.exit(1);
    }
    async.series([
        query("CREATE DATABASE IF NOT EXISTS lendsnap"),
        query("GRANT ALL ON lendsnap.* TO '" + credentals.user + "'@'%' " + 
            "IDENTIFIED BY '" + credentals.password + "'")
    ], function (error) {
        if (error) {
            console.error("Error - " + error);
            process.exit(1);
        } else {
            console.log("Database setup complete");
            process.exit();
        }
        
    });
});
