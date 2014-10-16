var _ = require('lodash');
var path = require('path');
var Sequelize = require('sequelize');
var config = require('./config');
var sequelize = new Sequelize(
    config.get("dbName"),
    config.get("dbUser"),
    config.get("dbPassword"));
var helpers = require('./helpers');
var winston = require("winston");
var db = {};

helpers.getModules().forEach(function (moduleName) {
    var modulePath = path.join(__dirname, moduleName, 'models');
    var models;
    try {
        models = sequelize.import(modulePath);
    } catch (e) {
        if (e.code != "MODULE_NOT_FOUND") {
            throw e;
        }
    }
    if (models && !(models instanceof Array)) {
        models = [models];
    }
    if (models) {
        _.each(models, function (model) {
            winston.info("Assigning " + model.name);
            db[model.name] = model;
        });
    }

});

Object.keys(db).forEach(function(modelName) {
    if ('associate' in db[modelName]) {
        db[modelName].associate(db);
    }
});

module.exports = _.extend({
    sequelize: sequelize,
    Sequelize: Sequelize
}, db);
