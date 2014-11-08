var _ = require('lodash');
var path = require('path');
var config = require('./config');
var winston = require("winston");

var mysql = require('mysql');
var connection = mysql.createConnection({
    database : config.get("dbName"),
    user : config.get("dbUser"),
    password: config.get("dbPassword")
});

module.exports = connection;
