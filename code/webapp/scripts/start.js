#!/bin/node
var helpers = require('./helpers');
var options = require('nomnom')
    .options({
        'apps': {
            default: helpers.getAppNames()
        },
        'environment' : {
            abbr: 'e',
            default: 'dev'
        },
        'command': {
            position: 0,
            help: 'What to do with those apps'
        }
    });
