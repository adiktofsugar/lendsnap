#!/usr/bin/env node
var config = require('../config');
config.setEnvironment("test");

var dbSetup = require('../db-setup');
var db = require('../db');
var dbSetupData = require('../test/db-setup-data');

var chalk = require("chalk");

var callback = function (error) {
    if (error) {
        console.log(chalk.red("Error:"), error);
    }
    process.exit();
};

dbSetup.empty(function (error) {
    if (error) {
        console.log(chalk.red("dbSetup callback empty error"), error);
        return callback(error);
    }
    dbSetupData(callback);
});
