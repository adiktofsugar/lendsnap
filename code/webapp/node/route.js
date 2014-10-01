var invitation = require('./invitation');
var sendHtml = require('send-data/html');
var page = require('./page');

var route = {
    router: null,
    setRouter: function set (router) {
        this.router = router;
        return this;
    },
    start: function start () {
        this.router.get('/', function (req, res, next) {
            sendHtml(req, res, page.render('index.html'));
        });

        this.router.post('/accept-invite', function (req, res, next) {
            invitation.get(req.body['invite_id'], function (err, invite) {
                sendHtml(req, res, page.render('invite.html', {
                    error: err,
                    invite: invite
                }));
            });
        });
        this.router.get('/log-in', function (req, res, next) {
            sendHtml(req, res, page.render('log-in.html'));
        });
        return this;
    }
};

module.exports = route;
