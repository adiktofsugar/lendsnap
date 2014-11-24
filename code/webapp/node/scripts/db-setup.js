#!/usr/bin/env node
var async  = require('async');
var options = require('nomnom')
    .option('destroy', {
        flag: true,
        help: 'Run "destroy" step'
    })
    .option('baseData', {
        full: 'base-data',
        default: undefined,
        flag: true,
        help: 'Run "baseData" step (default if env is dev)'
    })
    .option('environment', {
        abbr: 'e',
        help: 'Set environment explicitly'
    })
    .help("Setup the database")
    .parse();

var config = require('../config');
if (options.environment) {
    config.setEnvironment(options.environment);
}
if (options.baseData === undefined) {
    options.baseData = (config.getEnvironment() == "dev") ? true : false;
}
var db = require('../db');
var dbSetup = require('../db-setup');
var chalk = require("chalk");

var rootConnection = require('mysql').createConnection({
    user: 'root',
    password: 'a',
    host: config.get('dbHost')
});
rootConnection.connect();

var queryFunctions = [
        "CREATE DATABASE IF NOT EXISTS lendsnap;",
        "CREATE DATABASE IF NOT EXISTS lendsnap_test;"
    ]
    .map(function (queryString) {
        return function (callback) {
            rootConnection.query(queryString, function (error) {
                if (error) {
                    console.log(chalk.red("Failed query"), queryString);
                }
                callback(error);
            });
        };
    });
async.series(queryFunctions, function (error) {
        if (error) {
            console.log(chalk.red("Error setting up databases"), error);
            process.exit();
            return;
        }
        console.log(chalk.green("Success!"));
        process.exit();
        // var next = function (error) {
        //     if (error) {
        //         console.log(chalk.red("Error at the end."), error);
        //     } else {
        //         console.log(chalk.green("Everything's done!"));
        //     }
            
        //     process.exit();
        // };
        // dbSetup({
        //     destroy: options.destroy,
        //     baseData: options.baseData
        // }, function (error) {
        //     if (error) return next(error);
        //     next();
        // });
    });
