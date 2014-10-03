var _ = require('lodash');
var path = require('path');
var Sequelize = require('sequelize');
var sequelize = new Sequelize('lendsnap', 'lendsnap', 'a');
var helpers = require('./helpers');
var winston = require("winston");
var db = {};

helpers.getModules().forEach(function (moduleName) {
    var modulePath = path.join(__dirname, moduleName, 'models');
    try {
        var model = sequelize.import(modulePath)
        db[model.name] = model;
    } catch (e) {
        if (e.code != "MODULE_NOT_FOUND") {
            throw e;
        } else {
            winston.error(modulePath + ' NOT FOUND');
        }
    }

});

Object.keys(db).forEach(function(modelName) {
    if ('associate' in db[modelName]) {
        db[modelName].associate(db);
    }
})

module.exports = _.extend({
    sequelize: sequelize,
    Sequelize: Sequelize
}, db);
