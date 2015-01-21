var Uri = require('jsuri');
var send = require('send');
var config = require('./config');
var request = require('request');

function mount (app) {
    app.get('/', function (req, res, next) {
        if (req.session.userId) {
            return res.redirect('/document-package');
        }
        res.render('index.html');
    });
    app.get('/media/*', function (req, res, next) {
        var path = new Uri(req.url).path();
        var relativePath = path.replace(new RegExp('/media/[^/]+'), '');
        //console.log('media relativePath', relativePath);
        send(req, relativePath, {root: '/var/lendsnap/media'})
        .on("error", next)
        .on("directory", next)
        .pipe(res);
    });
    app.get('/uploaded/*', function (req, res, next) {
        var path = new Uri(req.url).path();
        var relativePath = path.replace(new RegExp('/uploaded'), '');
        send(req, relativePath, {root: '/var/lendsnap/uploaded'})
        .on("error", next)
        .on("directory", next)
        .pipe(res);
    });

    app.route('/log-in')
    .get(function (req, res, next) {
        res.render('log-in.html');
    })
    .post(function(req, res, next) {
        var accountService = config.getJson('/services/account');
        if (!accountService) {
            console.error("account service is down");
            return res.redirect(new Uri('/log-in')
                .addQueryParam('error', 'System is down. Try later.')
                .toString());
        }
        var uri = new Uri(accountService.address)
            .setPath('/authorize').toString();
        var data = {
            email: req.body.email,
            password: req.body.password
        };
        request.post({uri: uri, json: data}, function (error, response, body) {
            if (error || response.statusCode.toString().match(/^(4|5)/)) {
                console.error("Failed log in attempt", "error", error, "statusCode", response.statusCode, "