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
var config = require('../config');
if (options.environment) {
    config.setEnvironment(options.environment);
}
if (options.addBaseData === undefined) {
    options.addBaseData = (config.getEnvironment() == "dev") ? true : false;
}

var db = require('../db');
var dbSetup = require('../db-setup');
var chalk = require("chalk");

var addBaseData = function (next) {
    console.log(chalk.green("Adding base data..."));
    var md5 = require("MD5");

    var createPermissions = function (cb) {
        db.Permission.bulkCreate([{
            name: "admin"
        }, {
            name: "canInvite"
        }])
        .then(cb, next);
    };

    var createUsers = function (cb) {
        db.User.bulkCreate([{
            email: "test@example.com",
            password: md5("a")
        }, {
            email: "admin@example.com",
            password: md5("a")
        }])
        .then(cb, next);
    };
    
    var findUsersAndPermissions = function (cb) {
        db.User.findAll()
        .then(function (users) {
            db.Permission.findAll()
            .then(function (permissions) {
                cb(users, permissions);
            }, next);
        }, next);
    };

    createPermissions(function () {
        createUsers(function () {
            findUsersAndPermissions(function (users, permissions) {
                users[1].setPermissions(permissions)
                .then(function () {
                    next();
                }, next);
            });
        });
    });
};

var next = function (error) {
    if (error) {
        console.log(chalk.red("Error at the end."), error);
    } else {
        console.log(chalk.green("Everything's done!"));
    }
    
    process.exit();
};
dbSetup.empty(function (error) {
    if (error) return next(error);

    if (options.addBaseData) {
        addBaseData(function (error) {
            if (error) {
                console.log(chalk.red("Error with base data"), error);
            }
            next(error);
        });
    } else {
        next();
    }
})
