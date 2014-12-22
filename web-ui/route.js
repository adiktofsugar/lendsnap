var Uri = require('jsuri');
var send = require('send');

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
        console.log('media relativePath', relativePath);
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
}

module.exports = {
    mount: mount
};
