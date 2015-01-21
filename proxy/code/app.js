var config = require('./config');
var http = require('http');
var https = require('https');
var Uri = require('jsuri');
var httpProxy = require('http-proxy');
var fs = require('fs');

    
http.createServer(function (req, res) {
    var uri = new Uri(req.url);
    uri.protocol('https');
    uri.host(req.headers.host);
    console.log("Redirecting to https version: " + uri.toString());
    res.writeHead(301, "Only accessible through https", {
        'Location': uri.toString()
    });
    res.end();
}).listen(80);


var proxy = httpProxy.createProxyServer({});
function listener(req, res) {
    var uri = new Uri(req.url);
    uri.host(req.headers.host);

    var app = "web-ui";
    if (uri.path().match(new RegExp('^/account'))) {
        app = "account";
    }
    config.getJson('/services/' + app, function (error, service) {
        if (service) {
            return proxy.web(req, res, {
                target: 'http://' + service.host + ':' + service.port
            });
        }
        console.error('No service found for uri', uri.host(), req.url, "tried", app);
        var errorMessage = "This page doesnt exist.";
        var errorTemplate = fs.readFileSync('error.html', {encoding: 'utf-8'});
        var errorString = errorTemplate.replace('__message__', errorMessage);
        
        res.statusCode = 404;
        res.end(errorString);
    });
}


var options = {
  key: fs.readFileSync('/var/lendsnap/proxy/real-signed-cert/host.key'),
  cert: fs.readFileSync('/var/lendsnap/proxy/real-signed-cert/bundle.crt')
};
https.createServer(options, listener).listen(443);
