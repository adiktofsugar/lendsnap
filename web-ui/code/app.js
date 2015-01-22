#!/usr/bin/env node
var config = require('./config');
var _ = require('lodash');
var express = require('express');
var http = require('http');
var Url = require('jsuri');
var nunjucks = require('nunjucks');
var multer = require('multer');
var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
var request = require('request');
var Uri = require('jsuri');

var app = express();
app.set('x-powered-by', false);
app.set('json spaces', 4);

console.log("using nunjucks configure as - ", __dirname + '/templates');
var nunjucksEnvironment = nunjucks.configure(__dirname + '/templates', {
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

app.use(function useMethodPassedByQuery(req, res, next) {
    if (req.query._method) {
        req.method = req.query._method;
    }
    next();
});

app.use(function addUser(req, res, next) {
    req.getUser = function (callback) {
        var accountService = config.getJson('/services/account');
        if (!accountService) {
            console.error("account service is not up");
            return callback(new Error("account service is not up"));
        }
        var uri = new Uri('http://' + accountService.address)
            .setPath('/account/' + req.session.userId)
            .toString();
        request(uri, function (error, response, body) {
            if (error) {
                console.error("Error calling account service", uri, error, "response", response);
                return callback(error);
            }
            callback(null, body);
        });
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
        version: "324",
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

require('./route').mount(app);
require('./document-package/route').mount(app);

http.createServer(app).listen(3000, function () {
    config.broadcast();
});
