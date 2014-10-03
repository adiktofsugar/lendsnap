var _ = require("lodash");
var account = require('./index');

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
            if (err) throw err;
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
        res.render('account.html');
    });
    router.post('/account', function (req, res, next) {
        var user = req.user;
        _.each(["email", "first_name"], function (name) {
            var value = req.body[name];
            user.set(name, value);
        });
        user.save()
            .then(function () {
                res.redirect('/account');
            }, function (error) {
                res.redirect('/account?error=' + encodeURIComponent(error.message))
            });
    });
};
