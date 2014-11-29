var _ = require("lodash");
var Uri = require("jsuri");
var accountService = require('./service');
var winston = require('winston');

module.exports = function (router) {

    router.get('/log-in', function (req, res, next) {
        res.render('log-in.html', {
            email: req.query.email
        });
    });
    router.post('/log-in', function (req, res, next) {
        var email = req.body['email'];
        var password = req.body['password'];
        accountService.login(req, email, password, function (err, user) {
            winston.log("LOGIN service response - Error: ", err, "User", user);
            if (err) {
                var errorMessage = "Failed log in - " + err.message;
                res.redirect(new Uri("/log-in")
                    .addQueryParam("error", errorMessage)
                    .addQueryParam("email", email)
                    .toString());
            } else {
                res.redirect('/');
            }
        });
    });
    router.get('/logout', function (req, res, next) {
        accountService.logout(req, function (err) {
            if (err) return next(err);
            res.redirect('/');
        });
    });
    router.get('/register', function (req, res, next) {
        res.render('register.html', {
            email: req.query.email
        });
    });
    router.post('/register', function (req, res, next) {
        var email = req.body['email'];
        var password = req.body['password'];
        accountService.register(email, password, function (err, user) {
            if (err) {
                var errorMessage = err.message;
                res.redirect(new Uri("/register")
                    .addQueryParam("error", errorMessage)
                    .addQueryParam("email", email)
                    .toString());
            } else {
                accountService.login(req, email, password, function (err) {
                    if (err) {
                        next(err);
                    } else {
                        res.redirect('/');
                    }
                });
            }
        });
    });

    router.get('/set-password', function (req, res, next) {
        res.render('password-set.html', {
            email: req.query.email
        });
    });
    router.post('/set-password', function (req, res, next) {
        var email = req.body.email;
        var password = req.body.password;

        accountService.setPassword(email, password, function (error) {
            if (error) {
                res.redirect(new Uri('/set-password')
                    .addQueryParam("email", email)
                    .addQueryParam('error', error.message)
                    .toString());
                return;
            }
            accountService.login(req, email, password, function (error, user) {
                if (error) return next(error);
                res.redirect(new Uri('/account')
                    .addQueryParam("message", "Password set!")
                    .toString());
            });
        });
    });
    

    router.get('/account', function (req, res, next) {
        res.render('account.html');
    });
    router.post('/account', function (req, res, next) {
        var updateUser = function (user) {
            accountService.updateUser(user, {
                email: req.body.email,
                first_name: req.body.first_name,
                last_name: req.body.last_name
            }, function (error) {
                if (error) {
                    res.redirect(new Uri('/account')
                        .addQueryParam("error", error.message)
                        .toString());
                } else {
                    res.redirect('/account');
                }
            });
        };

        if (req.body.id) {
            accountService.getUserById(req.body.id, function (error, user) {
                if (error) return next(error);
                updateUser(user);
            });
        } else {
            updateUser(req.user);
        }
    });
};
