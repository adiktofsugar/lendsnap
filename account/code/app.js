var restify = require('restify');
var config = require('./config');
var userService = require('./user-service');
var authorizeService = require('./authorize-service');

var server = restify.createServer({
    name: "Lendsnap"
});
server.use(restify.bodyParser());

server.on('uncaughtException', function (req, res, route, error, next) {
   console.error("url", req.url, "route", route, "error", error.stack);
   res.send(500, new Error("Something unexpected happened"));
});

server.get('/account/:id', function (req, res, next) {
    var id = req.params.id;
    userService.getUserById(id, function (error, user) {
        if (error) {
            return res.send(new Error("Couldnt get user by id \"" + id + "\""));
        }
        res.json(user);
    });
});
server.put('/account/:id', function (req, res, next) {
    var id = req.params.id;
    userService.updateUserById(id, req.params, function (error, user) {
        if (error) {
            return res.send(new Error("Couldnt update user by id \"" + id + "\""));
        }
        res.json(user);
    });
});
server.post('/account', function (req, res, next) {
    userService.createUser(req.params, function (error, user) {
        if (error) {
            return res.send(new Error("Couldnt create user"));
        }
        res.json(user);
    });
});

server.post('/authorize', function (req, res, next) {
    console.log('content type', req.getContentType());
    console.log('params', req.params);
    var email = req.params.email;
    var password = req.params.password;
    
    authorizeService.authorize(email, password, function (error, user) {
        if (error) {
            console.log("authorizeService authorize error", error);
            return res.send(401, new Error("Error authorizing user."));
        }
        return res.json(user);
    });
});

server.listen(8080, function () {
    config.broadcast();
});
