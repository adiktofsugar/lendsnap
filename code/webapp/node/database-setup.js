#!/usr/bin/env node

var db = require('./models');
var options = require('nomnom')
    .option('force', {
        abbr: 'f',
        flag: true,
        help: 'Drop tables before creating'
    })
    .help("Setup the database")
    .parse();

var force = options.force;

db.sequelize.sync({
    force: options.force
});
