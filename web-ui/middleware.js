var _ = require('lodash');
var Uri = require('jsuri');
var Qs = require('qs');

function addQuery(req, res, next) {    
    var uri = new Uri(req.url);
    
    var queryString = uri.query().slice(1);
    req.query = Qs.parse(queryString);
    
    next();
}
function addMethodByQuery(req, res, next) {
    if (req.query._method) {
        req.method = req.query._method.toUpperCase();
    }
    next();
}
function addRedirect(req, res, next) {
    res.redirect = function (redirectLocation) {
        res.writeHead(302, {
            'Location': redirectLocation
        });
        res.end();
    };
    next();
}
function addRender(req, res, next) {
    res.render = function (templateName, data) {
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
        
        data = _.extend({
            version: "123",
            page_title: pageTitle,
            user: req.user,
            error: req.query.error,
            message: req.query.message
        }, data || {});
        console.log("TEMPLATE DATA - ", data);

        res.writeHead(200, {
            'Content-type': 'text/html'
        });
        res.write(req.nunjucks.render(templateName, data));
        res.end();
    };
    next();
}

function addJson(req, res, next) {
    res.json = function (json, options) {
        options = _.merge({
            statusCode: 200,
            headers: {
                'Content-type': 'application/json'
            }
        }, options || {});
        
        res.writeHead(options.statusCode, options.headers);
        res.write(JSON.stringify(json, null, 4));
        res.end();
    };
    next();
}
function addJsonError(req, res, next) {
    res.jsonError = function (error, options) {
        options = _.extend({
            statusCode: 400
        }, options || {});

        var json = {
            message: error.message || "Unknown"
        };
        
        res.json(json, {
            statusCode: options.statusCode
        });
    };
    next();
}

function errorHandler(err, req, res, next) {
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
}

module.exports = {
    addQuery: addQuery,
    addMethodByQuery: addMethodByQuery,
    addRedirect: addRedirect,
    addRender: addRender,
    addJson: addJson,
    addJsonError: addJsonError,
    errorHandler: errorHandler
};
