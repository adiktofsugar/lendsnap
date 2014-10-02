#!/usr/bin/env node

var options = require('nomnom')
    .option('force', {
        abbr: 'f',
        flag: true,
        help: 'Drop tables before creating'
    })
    .help("Setup the database")
    .parse();

var force = options.force;
var db = require('./models');

db.sequelize.sync({
    force: options.force
});
