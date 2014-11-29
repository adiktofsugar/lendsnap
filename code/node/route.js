var helpers = require('./helpers');
var path = require('path');
var Uri = require("jsuri");
var winston = require("winston");

var route = {
    router: null,
    setRouter: function set (router) {
        this.router = router;
        return this;
    },
    start: function start () {
        var router = this.router;

        router.get('/', function (req, res, next) {
            if (req.user) {
                return res.redirect('/document-package');
            }
            res.render('index.html');
        });

        helpers.getModules().forEach(function (moduleName) {
            var modulePath = path.join(__dirname, moduleName, 'route');
            try {
                require(modulePath)(router);
            } catch (e) {
                if (e.code != "MODULE_NOT_FOUND") {
                    throw e;
                } else {
                    winston.error(modulePath + ' NOT FOUND');
                }
            }
        });
        
        return this;
    }
};

module.exports = route;
