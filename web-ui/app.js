#!/usr/bin/env node

var _ = require('lodash');
var connect = require('connect');
var http = require('http');
var https = require('https');
var Url = require('jsuri');

http.createServer(function (req, res) {
    var uri = new Url(req.url);
    uri.protocol('https');
    uri.host(req.headers.host);
    console.log("Redirecting to https version: " + uri.toString());
    res.writeHead(301, "Only accessible through https", {
        'Location': uri.toString()
    });
    res.end();
}).listen(80);

var app = connect();

var cookieSession = require('cookie-session');
// store session state in browser cookie
app.use(cookieSession({
    keys: ['secret1', 'secret2'],
    name: "lendsnap",
    domain: ".lendsnap.com",
    httpOnly: false
}));

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


app.use(function (req, res, next) {
    console.info("Url: \"" + req.url + "\"");
    next();
});

var nunjucks = require('nunjucks');
nunjucks.configure('templates', {
    autoescape: true
});
app.use(function (req, res, next) {
    req.nunjucks = nunjucks;
    next();
});

var middleware = require('./middleware');
app.use(middleware.addUser);
app.use(middleware.addQuery);
app.use(middleware.addMethodByQuery);
app.use(middleware.addRedirect);
app.use(middleware.addRender);
app.use(middleware.addJson);
app.use(middleware.addJsonError);
app.use(middleware.errorHandler);

var Router = require('routes');
app.router = new Router();
app.use(function (req, res, next) {
    var path = require('url').parse(req.url).pathname;
    var match = app.router.match(path);
    if (match) {
        req.params = match.params;
        match.fn(req, res, next, match);
    } else {
        next();
    }
});

var route = require('./route');
route.mount(app);

var helper = require('./helper');
helper.getModules().forEach(function (moduleName) {
    var path = require('path');
    var moduleRoute;
    var moduleRoutePath = './' + moduleName + '/route';
    try {
        moduleRoute = require(moduleRoutePath);
    } catch (e) {
        if (e.code !== "MODULE_NOT_FOUND") {
            throw e;
        }
    }
    console.log("adding routes for", moduleName, Boolean(moduleRoute));
    if (!moduleRoute) {
        return;
    }
    moduleRoute.mount(app);
});

var config = require('./config');
var fs = require('fs');

var options = {
  key: fs.readFileSync('real-signed-cert/host.key'),
  cert: fs.readFileSync('real-signed-cert/bundle.crt')
};
https.createServer(options, app).listen(443, function () {
    config.broadcast();
});
