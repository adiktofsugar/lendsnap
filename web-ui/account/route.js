var Uri = require("jsuri");
var accountService = require('./service');

function mount(app) {
    app.route('/log-in')
    .get(function (req, res, next) {
        res.render('log-in.html', {
            email: req.query.email
        });
    })
    .post(function (req, res, next) {
        var email = req.body['email'];
        var password = req.body['password'];
        accountService.login(req, email, password, function (err, user) {
            console.log("LOGIN service response - Error: ", err, "User", user);
            if (err) {
                var errorMessage = "Failed log in - " + err.message;
                console.error(errorMessage);
                
                res.redirect(new Uri("/log-in")
                    .addQueryParam("error", errorMessage)
                    .addQueryParam("email", email)
                    .toString());
            } else {
                res.redirect('/');
            }
        });
    });
    app.get('/logout', function (req, res, next) {
        accountService.logout(req, function (err) {
            if (err) return next(err);
            res.redirect('/');
        });
    });
    app.route('/register')
    .get(function (req, res, next) {
        res.render('register.html', {
            email: req.query.email
        });
    })
    .post(function (req, res, next) {
        var accountService = require('./service');

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

    app.route('/set-password')
    .get(function (req, res, next) {
        res.render('password-set.html', {
            email: req.query.email
        });
    })
    .post(function (req, res, next) {
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
    

    app.route('/account')
    .get(function (req, res, next) {
        res.render('account.html');
    })
    .post(function (req, res, next) {
        var updateUser = function (userId) {
            accountService.updateUser(userId, {
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

        req.getUser(function (error, user) {
            if (error) {
                return next(error);
            }
            updateUser(user.id);
        });
    });
}
module.exports = {
    mount: mount
};
