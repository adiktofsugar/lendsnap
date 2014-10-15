var _ = require("lodash");
var account = require('./index');
var invitation = require('../invitation');

module.exports = function (router) {

    router.get('/log-in', function (req, res, next) {
        res.render('log-in.html');
    });
    router.post('/log-in', function (req, res, next) {
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
    router.get('/logout', function (req, res, next) {
        account.logout(req, function (err) {
            if (err) return next(err);
            res.redirect('/');
        });
    });
    router.get('/register', function (req, res, next) {
        res.render('register.html');
    });
    router.post('/register', function (req, res, next) {
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
                    res.redirect('/account?error=' + encodeURIComponent(error.message))
                });
        };

        if (req.body.id) {
            account.getUserById(req, req.body.id, function (error, user) {
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
            res.redirect('/account?message=' +
                encodeURIComponent("Invitation created with code " + newInvite.code));
        });
    });
};
