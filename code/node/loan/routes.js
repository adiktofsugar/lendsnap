var Uri = require('jsuri');

module.exports = function (router) {
    var needsUser = function (handler) {
        return function (req, res, next) {
            if (!req.user) {
                res.redirect(new Uri('/log-in')
                    .addQueryParam("error", "You must be logged in.")
                    .toString());
            } else {
                handler(req, res, next);
            }
        };
    };
    router.get('/loan', needsUser(function (req, res, next) {
        var loan = require('./index');

        loan.isUserReadyToApply(req.user, function (error, isReady) {
            if (error) return next(error);
            if (!isReady) {
                res.redirect('/loan/profile');
            } else {
                loan.getCurrentForUser(req.user, function (error, loanModel) {
                    if (error) return next(error);
                    if (!loanModel) {
                        res.render('loan/new.html');
                    } else {
                        res.render('loan/index.html', {
                            loan: loanModel
                        });
                    }
                });
            }
        });
    }));
    router.post('/loan', needsUser(function (req, res, next) {
    }));

    router.get('/loan/profile', needsUser(function (req, res, next) {
        res.render('loan/profile.html');
    }));
    router.post('/loan/profile', needsUser(function (req, res, next) {
        account.update(req.user, {
            gender: req.body.gender
        }, function (error, user) {
            if (error) return next(error);
            res.redirect('/loan');
        })
    }));
};
