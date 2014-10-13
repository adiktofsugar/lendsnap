var invitation = require('./index');

module.exports = function (router) {
    router.post('/accept-invite', function (req, res, next) {
        var code = req.body['invite_id'];
        invitation.get(code, function (err, invite) {
            if (err) {
                res.redirect('/?error=' + encodeURIComponent(err.message));
            } else if (!invite) {
                res.redirect('/?error=' +
                    encodeURIComponent("There is no invitation for that code ("+code+")."));
            } else {
                res.render('invite.html', {
                    invite: invite
                });
            }
        });
    });
};
