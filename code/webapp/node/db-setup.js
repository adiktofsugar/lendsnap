var async = require("async");
var chalk = require("chalk");

var empty = function (finalCb) {
    var db = require('./db');
    console.log(chalk.blue("Syncing database"));
    async.waterfall([
        function (cb) {
            console.log(chalk.green("Remove foreign key constraint..."));
            db.sequelize.query('set FOREIGN_KEY_CHECKS = 0')
            .then(function () {
                cb();
            }, cb);
        },
        function (cb) {
            console.log(chalk.green("Sequelize sync..."));
            db.sequelize.sync({
                force: true
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
            }, cb);
        }
    ], finalCb);
};

exports.empty = empty;
