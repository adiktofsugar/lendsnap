#!/usr/bin/env node

var options = require('nomnom')
    .option('force', {
        abbr: 'f',
        flag: true,
        help: 'Drop tables before creating'
    })
    .option('add-base-data', {
        default: undefined,
        flag: true,
        help: 'Add default data (default true if dev)'
    })
    .option('environment', {
        abbr: 'e',
        help: 'Set environment explicitly'
    })
    .help("Setup the database")
    .parse();

var force = options.force;
var config = require('./config');
if (options.environment) {
    config.setEnvironment(options.environment);
}
if (options.addBaseData === undefined) {
    options.addBaseData = (config.getEnvironment() == "dev") ? true : false;
}

var db = require('./db');
var async = require("async");
var chalk = require("chalk");

console.log(chalk.blue("Syncing database"));
async.waterfall([
    function (cb) {
        console.log(chalk.green("Remove foreign key constraint..."));
        db.sequelize.query('set FOREIGN_KEY_CHECKS = 0')
        .then(function () {
            cb();
        }, function (error) {
            cb(error);
        });
    },
    function (cb) {
        console.log(chalk.green("Sequelize sync..."));
        db.sequelize.sync({
            force: options.force
        })
        .then(function () {
            console.log(chalk.green("Sequelize sync success!"));
            cb();
        },function (error) {
            console.log(chalk.red("Sequelize Error Callback: " + error.message));
            console.error(error.stack);
            cb(error);
        });
    },
    function (cb) {
        console.log(chalk.green("Adding foreign key again..."));
        db.sequelize.query('set FOREIGN_KEY_CHECKS = 1')
        .then(function () {
            cb();
        }, function (error) {
            cb(error);
        });
    },
    function (cb) {
        if (options.addBaseData) {
            console.log(chalk.green("Adding base data..."));
            var md5 = require("MD5");
            db.User.create({
                email: "test@example.com",
                password: md5("a")
            })
            .then(function () {
                cb();
            }, function (error) {
                cb(error);
            });
        }
    },
    function (cb) {
        console.log(chalk.green("Everything's done!"));
        process.exit();
    }
]);
