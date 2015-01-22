var config = require('./config');
var union = require('union');
var ecstatic = require('ecstatic');
var Uri = require('jsuri');
var server = union.createServer({
    before: [
        function (req, res) {
            var uri = new Uri(req.url);
            var path = uri.path().replace(new RegExp('^/media/\\d+/(.+)'), '/$1');
            console.log('Modified path is ', path);
            req.url = uri.setPath(path).toString();
            res.emit('next');
        },
        ecstatic({root: __dirname + '/'})
    ]
});
server.listen(config.port, function () {
    config.broadcast();
});
