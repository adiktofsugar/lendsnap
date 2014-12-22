#!/usr/bin/env node
var _ = require('lodash');
var express = require('express');
var http = require('http');
var Url = require('jsuri');
var nunjucks = require('nunjucks');
var multer = require('multer');
var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');

var app = express();
//app.set('views', 'templates');
//app.set('view engine', 'nunjucks');
app.set('x-powered-by', false);
app.set('json spaces', 4);

var nunjucksEnvironment = nunjucks.configure('templates', {
    autoescape: true,
    express: app
});
app.use(cookieSession({
    keys: ['secret1', 'secret2'],
    name: "lendsnap",
    domain: ".lendsnap.com",
    httpOnly: false
}));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(multer());

app.use(function (req, res, next) {
    console.info("Url: \"" + req.url + "\"");
    next();
});
app.use(function addMethodByQuery(req, res, next) {
    if (req.query._method) {
        req.method = req.query._method.toUpperCase();
    }
    next();
});

app.use(function addUser(req, res, next) {
    req.getUser = function (callback) {
        var accountService = require('./account/service');
        accountService.getUserById(req.session.userId, callback);
    };
    next();
});
app.use(function addTemplateVariables(req, res, next) {
    var pageTitleParts = require('url').parse(req.url).pathname
            .replace(/^\//, '')
            .split('/')
            .filter(function (token) {
                return !!token
                    .replace(/^\s*/,'')
                    .replace(/\s*$/, '');
            });
    var pageTitle = "Lendsnap";
    if (pageTitleParts.length) {
        pageTitle += " - " + pageTitleParts.join(" - ");
    }
    _.extend(app.locals, {
        page_title: pageTitle,
        error: req.query.error,
        message: req.query.message
    });
    
    req.getUser(function (error, user) {
        app.locals.user = user;
        next();
    });
});

app.use(function errorHandler(err, req, res, next) {
    if (err) {
        console.error(err);
        if (err.stack) {
            _.each(err.stack.split(/\n/g), function (line) {
                console.error(line);
            });
        }
        res.render('error.html', {
            error: err
        });
    } else {
        next();
    }
});

var helper = require('./helper');
helper.getModules().concat(['.']).forEach(function (moduleName) {
    var path = require('path');
    var moduleRoute;
    var moduleRoutePath = './' + path.join(moduleName, 'route');
    try {
        moduleRoute = require(moduleRoutePath);
    } catch (e) {
        if (e.code !== "MODULE_NOT_FOUND") {
            throw e;
        }
    }
    if (!moduleRoute) {
        return;
    }
    console.log("adding routes for", moduleName);
    moduleRoute.mount(app);
});


var config = require('./config');
var fs = require('fs');
var options = {
  key: fs.readFileSync('real-signed-cert/host.key'),
  cert: fs.readFileSync('real-signed-cert/bundle.crt')
};
http.createServer(app).listen(3000, function () {
    config.broadcast();
});
