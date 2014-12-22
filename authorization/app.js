var restify = require('restify');
var config = require('./config');

var server = restify.createServer({
    name: "Lendsnap"
});

var getToken = function () {
    return require('crypto')
        .createHash('sha512')
        .update(config.secret)
        .digest('hex');
};

server.get('/request-token', function (req, res, next) {
    res.json({
        request_token: getToken()
    });
});

server.post('/authorize', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var requestToken = req.body.request_token;
    if (requestToken != getToken()) {
        return res.send(401, new Error("Invalid request token"));
    }
    function respondFromUser(user) {
        if (!user.id) {
            return res.send(401, new Error("You credentials are invalid."));
        }
        res.json({
            access_token: user.access_token
        });
    }
    request('http://' + config['web-ui'].host + ':' + config['web-ui'].port +
        '/api/users?username='+username+'&password='+password,
        function (error, response, body) {
            if (error) {
                console.log("Error retrieving user from web ui", error, response, body);
                return res.send(new Error("Couldn't access users api."));
            }
            respondFromUser(body);
        });

});

server.listen(8080, function () {
    config.broadcast();
});
