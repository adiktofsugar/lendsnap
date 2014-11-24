var config = require('./config');
var winston = require("winston");

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: config.get('dbHost'),
    database : config.get("dbName"),
    user : config.get("dbUser"),
    password: config.get("dbPassword")
});

module.exports = connection;
