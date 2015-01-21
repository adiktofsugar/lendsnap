<<<<<<< HEAD
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
  key: fs.readFileSync('real-signed-cert/host.key'),
  cert: fs.readFileSync('real-signed-cert/bundle.crt')
};
https.createServer(options, listener).listen(443);
=======
;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.tab = {
    name : 'tab',

    version : '5.5.0',

    settings : {
      active_class: 'active',
      callback : function () {},
      deep_linking: false,
      scroll_to_content: true,
      is_hover: false
    },

    default_tab_hashes: [],

    init : function (scope, method, options) {
      var self = this,
          S = this.S;

      this.bindings(method, options);
      this.handle_location_hash_change();

      // Store the default active tabs which will be referenced when the
      // location hash is absent, as in the case of navigating the tabs and
      // returning to the first viewing via the browser Back button.
      S('[' + this.attr_name() + '] > .active > a', this.scope).each(function () {
        self.default_tab_hashes.push(this.hash);
      });
    },

    events : function () {
      var self = this,
          S = this.S;

      var usual_tab_behavior =  function (e) {
          var settings = S(this).closest('[' + self.attr_name() +']').data(self.attr_name(true) + '-init');
          if (!settings.is_hover || Modernizr.touch) {
            e.preventDefault();
            e.stopPropagation();
            self.toggle_active_tab(S(this).parent());
          }
        };

      S(this.scope)
        .off('.tab')
        // Click event: tab title
        .on('focus.fndtn.tab', '[' + this.attr_name() + '] > * > a', usual_tab_behavior )
        .on('click.fndtn.tab', '[' + this.attr_name() + '] > * > a', usual_tab_behavior )
 
>>>>>>> recover-origin/master
