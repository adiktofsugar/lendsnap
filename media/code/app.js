var config = require('./config');
var httpServer = require('http-server');
var server = httpServer.createServer({
    root: '/var/lendsnap/media',
    
});
server.listen(config.port, function () {
    config.broadcast();
});
