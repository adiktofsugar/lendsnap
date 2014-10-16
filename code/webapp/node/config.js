var _ = require('lodash');
var winston = require("winston");

var baseConfig = {
    dbName: "lendsnap",
    dbUser: "lendsnap",
    dbPassword: "a"
};
var environmentSpecficConfig = {
    "test": {
        dbName: "lendsnap_test"
    },
    "dev": {
        global_template_vars: {
            in_develop_mode: true
        }
    },
    "prod": {
    }
};

var env;
var actualConfig;

var setEnvironment = function (_env) {
    env = _env;
    actualConfig = _.extend({}, baseConfig, environmentSpecficConfig[env]);

    // winston.add(winston.transports.File, {
    //     filename: 'logs/node-web-server.log'
    // });
};

setEnvironment(process.env.NODE_ENV || "dev");

module.exports = {
    setEnvironment: setEnvironment,
    getEnvironment: function () {
        return env;
    },
    get: function (key) {
        return actualConfig[key];
    }
}

