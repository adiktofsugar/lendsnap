var invitation = require('./invitation');
var account = require('./account');
var sendData = require('send-data');

var route = {
    router: null,
    setRouter: function set (router) {
        this.router = router;
        return this;
    },
    start: function start () {
        this.router.get('/', function (req, res, next) {
            res.render('index.html');
        });

        this.router.post('/accept-invite', function (req, res, next) {
            invitation.get(req.body['invite_id'], function (err, invite) {
                res.render('invite.html', {
                    error: err,
                    invite: invite
                });
            });
        });
        this.router.get('/log-in', function (req, res, next) {
            res.render('log-in.html', {
                error: req.query["error"]
            });
        });
        this.router.post('/log-in', function (req, res, next) {
            var email = req.body['email'];
            var password = req.body['password'];
            account.login(req, email, password, function (err, user) {
                if (err) {
                    var errorMessage = "Failed log in - " + err.message;
                    res.redirect("/log-in?error=" + encodeURIComponent(errorMessage));
                } else {
                    res.redirect('/');
                }
            });
        });
        this.router.get('/register', function (req, res, next) {
            res.render('register.html', {
                error: req.query["error"]
            });
        });
        this.router.post('/register', function (req, res, next) {
            var email = req.body['email'];
            var password = req.body['password'];
            account.register(email, password, function (err, user) {
                if (err) {
                    var errorMessage = err.message;
                    res.redirect("/register?error=" + encodeURIComponent(errorMessage));
                } else {
                    account.login(req, email, password, function (err) {
                        if (err) {
                            next(err);
                        } else {
                            res.redirect('/');
                        }
                    });
                }
            });
        });
        return this;
    }
};

module.exports = route;
