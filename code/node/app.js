#!/usr/bin/env node

var config = require('./config');
var connect = require('connect');
var http = require('http');
var _ = require('lodash');
var winston = require("winston");
var url = require('url');
var Qs = require('qs');
var sendData = require('send-data');
var sendHtml = require('send-data/html');
var sendJson = require('send-data/json');
var nunjucks = require('nunjucks');

var compression = require('compression');
var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
var connectRoute = require('connect-route');

var appRoute = require('./route');
var db = require('./db');
var app = connect();

// gzip/deflate outgoing responses
app.use(compression());

// store session state in browser cookie
app.use(cookieSession({
    keys: ['secret1', 'secret2'],
    name: "lendsnap",
    domain: ".lendsnap.com",
    httpOnly: false
}));

app.use(function (req, res, next) {
    winston.info("Url: \"" + req.url + "\"");
    next();
});


// add user from session
app.use(function (req, res, next) {
    winston.info("setting user...");
    if (req.session.userId) {
        winston.info("...user id exists", req.session.userId);
        db.User.find({
            where: {
                id: req.session.userId
            }
        })
        .then(function (user) {
            winston.info("...found user");
            req.user = user;
            next();
        }, function (error) {
            winston.error("...error", error);
        });
    } else {
        winston.info("...no user id");
        next();
    }
});

// parse urlencoded request bodies into req.body
app.use(bodyParser.urlencoded());

// get query parameters
app.use(function (req, res, next) {
    var queryString = url.parse(req.url, true).query;
    var parsedQueryString = Qs.parse(queryString);
    winston.info("parsed query string", parsedQueryString);
    req.query = parsedQueryString;
    
    next();
});

// add redirect
app.use(function (req, res, next) {
    res.redirect = function (path) {
        sendData(req, res, {
            statusCode: 302,
            headers: {
                location: path
            }
        });
    };
    next();
});

// define template render
app.use(function (req, res, next) {
    res.render = function (templateName, data, cb) {
        nunjucks.configure('templates', {
            autoescape: true
        });
        var pageTitleParts = req.url
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
        
        data = _.extend({
            version: "123",
            page_title: pageTitle,
            user: req.user,
            error: req.query.error,
            message: req.query.message
        }, data || {});

        sendHtml(req, res, nunjucks.render(templateName, data));
    };
    winston.info("--- render defined");
    next();
});

// json rendering
app.use(function (req, res, next) {
    res.json = function (json) {
        sendJson(req, res, json, {
            statusCode: 200
        });
    };
    res.jsonError = function (error, statusCode) {
        statusCode = statusCode || 400;
        sendJson(req, res, {
            message: error.message || "Unknown"
        }, {
            statusCode: statusCode
        });
    };
    next();
});


app.use(connectRoute(function (router) {
    appRoute.setRouter(router).start();

}));

app.use(function (err, req, res, next) {
    if (err) {
        winston.error(err);
        if (err.stack) {
            _.each(err.stack.split(/\n/g), function (line) {
                winston.error(line);
            });
        }
        res.render('error.html', {
            error: err
        });
    } else {
        next();
    }
});


http.createServer(app).listen(3000);
