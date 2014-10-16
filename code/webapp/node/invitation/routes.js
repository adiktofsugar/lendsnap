module.exports = function (router) {
    var Uri = require('jsuri');

    router.get('/invite/:code', function (req, res, next) {
        var invitation = require('./index');

        var code = req.params.code || req.query.code;
        invitation.getByCode(code, function (err, invite) {
            if (err) {
                res.redirect(new Uri('/')
                    .addQueryParam("error", err.message)
                    .toString());
            } else if (!invite) {
                res.redirect(new Uri('/')
                    .addQueryParam("error", "There is no invitation for that code ("+code+").")
                    .toString());
            } else {
                invite.getReceivedUser()
                .then(function (user) {
                    if (user.password) {
                        account.login(req, user, function (error) {
                            if (error) return next(error);
                            res.redirect('/account');
                        });
                    } else {
                        res.redirect(new Uri('/set-password')
                            .addQueryParam("message", "Thanks for joining! Please set your password")
                            .addQueryParam("email", user.email)
                            .toString());
                    }
                }, next);
            }
        });
    });
};
