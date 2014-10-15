module.exports = function (router) {
    router.get('/admin', function (req, res, next) {
        var account = require('../account');
        var db = require('../db');

        account.hasPermission(req.user, "admin", function (error) {
            if (error) return next(error);

            db.User.findAll({
                include: [db.Permission]
            })
            .then(function (users) {
                res.render("admin.html", {
                    users: users
                });
            }, function (error) {
                return next(error);
            });
        });
    });
    router.post('/admin/user/:id/permission', function (req, res, next) {
        var db = require('../db');
        if (!req.body.name) {
            return res.redirect('/admin?error=' + encodeURIComponent("Name Is Required"));
        }

        db.Permission.findOrCreate({
            where: {
                name: req.body.name
            }
        }).spread(function (permission, created) {

            db.User.find(req.params.id)
            .then(function (user) {
                user.addPermission(permission)
                .then(function () {
                    res.redirect('/admin?message=Success');
                }, next);
            }, next);
        }, next);
    });
    router.get('/admin/user/:userId/permission/:permissionId/delete',
    function (req, res, next) {
        var db = require('../db');
        db.User.find(req.params.userId)
        .then(function (user) {
            db.Permission.find(req.params.permissionId)
            .then(function (permission) {
                user.removePermission(permission)
                .then(function () {
                    res.redirect('/admin?message=' + encodeURIComponent("Removed permission"));
                }, next);
            }, next);
        }, next);
    });
}
