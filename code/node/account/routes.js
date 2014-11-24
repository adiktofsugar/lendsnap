var _ = require("lodash");
var Uri = require("jsuri");
var account = require('./index');
var invitation = require('../invitation');

module.exports = function (router) {

    router.get('/log-in', function (req, res, next) {
        res.render('log-in.html', {
            email: req.query.email
        });
    });
    router.post('/log-in', function (req, res, next) {
        var email = req.body['email'];
        var password = req.body['password'];
        account.login(req, email, password, function (err, user) {
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
        account.logout(req, function (err) {
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
        account.register(email, password, function (err, user) {
            if (err) {
                var errorMessage = err.message;
                res.redirect(new Uri("/register")
                    .addQueryParam("error", errorMessage)
                    .addQueryParam("email", email)
                    .toString());
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

    router.get('/set-password', function (req, res, next) {
        res.render('password-set.html', {
            email: req.query.email
        });
    });
    router.post('/set-password', function (req, res, next) {
        var email = req.body.email;
        var password = req.body.password;

        account.setPassword(email, password, function (error) {
            if (error) {
                res.redirect(new Uri('/set-password')
                    .addQueryParam("email", email)
                    .addQueryParam('error', error.message)
                    .toString());
                return;
            }
            account.login(req, email, password, function (error, user) {
                if (error) return next(error);
                res.redirect(new Uri('/account')
                    .addQueryParam("message", "Password set!")
                    .toString());
            });
        });
    });
    

    router.get('/account', function (req, res, next) {
        invitation.getSentInvites(req.user, function(err, invites) {
            if (err) return next(err);
            account.hasPermission(req.user, "canInvite", function (error) {
                res.render('account.html', {
                    lastRequest: {},
                    userCanInvite: !error,
                    invites: invites
                });
            });
        });
    });
    router.post('/account', function (req, res, next) {
        var updateUser = function (user) {
            _.each(["email", "firstName", "lastName"], function (name) {
                var value = req.body[name];
                user.set(name, value);
            });
            user.save()
                .then(function () {
                    res.redirect('/account');
                }, function (error) {
                    res.redirect(new Uri('/account')
                        .addQueryParam("error", error.message)
                        .toString());
                });
        };

        if (req.body.id) {
            account.getUserById(req.body.id, function (error, user) {
                if (error) return next(error);
                updateUser(user);
            });
        } else {
            updateUser(req.user);
        }
    });

    router.post('/account/invites', function (req, res, next) {
        invitation.create(req.user.email, req.body.email, {
            firstName: req.body.firstName,
            lastName: req.body.lastName
        }, function (err, newInvite) {
            if (err) return next(err);
            res.redirect(new Uri('/account')
                .addQueryParam("message", "Invitation created with code " + newInvite.code)
                .toString());
        });
    });
};
