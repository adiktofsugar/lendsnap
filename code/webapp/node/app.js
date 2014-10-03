var connect = require('connect')
var http = require('http')
var _ = require('lodash');

var winston = require("winston");
// winston.add(winston.transports.File, {
//     filename: 'logs/node-web-server.log'
// });
var db = require('./db');

var app = connect();

// gzip/deflate outgoing responses
var compression = require('compression')
app.use(compression())

// store session state in browser cookie
var cookieSession = require('cookie-session')
app.use(cookieSession({
    keys: ['secret1', 'secret2'],
    name: "lendsnap",
    domain: ".lendsnap.com",
    httpOnly: false
}))

app.use(function (req, res, next) {
    winston.info("Url: ", req.url);
    next();
});


// add user from session
app.use(function (req, res, next) {
    winston.info("setting user...");
    if (req.session.userId) {
        winston.info("...user id exists", req.session.userId);
        db.User.find({
            id: req.session.userId
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
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded())

// get query parameters
app.use(function (req, res, next) {
    var Qs = require('qs');
    var queryString = require('url')
        .parse(req.url, true)
        .query;
    var parsedQueryString = Qs.parse(queryString);
    winston.info("parsed query string", parsedQueryString);
    req.query = parsedQueryString;
    
    next();
});

// add redirect
app.use(function (req, res, next) {
    res.redirect = function (path) {
        var sendData = require('send-data');
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
        var nunjucks = require('nunjucks');
        nunjucks.configure('templates', {
            autoescape: true
        });
        data = _.extend({
            version: "123",
            page_title: req.url,
            user: req.user,
            error: req.query.error,
            mesage: req.query.message
        }, data || {});

        var sendHtml = require('send-data/html');
        sendHtml(req, res, nunjucks.render(templateName, data));
    };
    winston.info("--- render defined");
    next();
});

var connectRoute = require('connect-route');
app.use(connectRoute(function (router) {
    require('./route')
        .setRouter(router)
        .start();

}));

app.use(function (err, req, res, next) {
    if (err) {
        winston.error(err);
        res.render('error.html', {
            error: err
        });
    } else {
        next();
    }
});


http.createServer(app).listen(3000)
