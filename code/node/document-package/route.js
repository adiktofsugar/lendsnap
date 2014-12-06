var _ = require('lodash');
var Uri = require('jsuri');
var documentPackageService = require('./service');
var accountService = require('../account/service');
var async = require("async");

function mount (app) {
    app.router.addRoute('/document-package', function (req, res, next) {
        documentPackageService.getDocumentPackagesByUserId(req.user.id,
        function (error, documentPackages) {
            res.render('document-package/index.html', {
                error: error,
                document_packages: documentPackages
            });
        });
    });
    app.router.addRoute('/document-package/new', function (req, res, next) {
        documentPackageService.createDocumentPackage({
                user_id: req.user.id,
                banker_user_id: req.user.is_banker ? req.user.id : null
            },
        function (error, documentPackage) {
            if (error) { return next(error); }

            res.render('document-package/package-new.html', {
                document_package_user: req.user,
                document_package: documentPackage
            });
        });
    });
    app.router.addRoute('/document-package/:id', function (req, res, next) {
        if (req.method == "GET") {
            async.waterfall([
                function (callback) {
                    documentPackageService.getDocumentPackageById(req.params.id,
                    function (error, documentPackage) {
                            if (error) {
                                return callback(error);
                            }
                            callback(null, documentPackage);
                        });
                },
                function (documentPackage, callback) {
                    accountService.getUserById(documentPackage.user_id,
                    function (error, user) {
                            if (error) {
                                return callback(error);
                            }
                            callback(null, user, documentPackage);
                        });
                }
            ], function (error, user, documentPackage) {
                if (error) {
                    return next(error);
                }
                res.render('document-package/package.html', {
                    document_package_user: user,
                    document_package: documentPackage
                });
            });
        } else if (req.method == "POST") {
            var id = req.params.id;
            async.waterfall([
                function (callback) {
                    var userEmail = req.body.user_email;
                    console.log("user email", userEmail);
                    if (userEmail) {
                        accountService.getUserByEmail(userEmail,
                        function (error, user) {
                            console.log("getUserByEmail", error, user);
                            callback(error,  user);
                        });
                    } else {
                        callback(null, null);
                    }
                },
                function (userFromEmail, callback) {
                    console.log("userFromEmail", userFromEmail);
                    var parameters = req.body;
                    delete parameters.user_email;
                    if (userFromEmail) {
                        parameters.user_id = userFromEmail.id;
                    }
                    documentPackageService.updateDocumentPackage(id, parameters, callback);
                }
            ], function (error) {
                if (error) {
                    return res.redirect(new Uri('/document-package/' + id)
                        .addQueryParam("error", error)
                        .toString());
                }
                res.redirect(new Uri('/document-package')
                    .addQueryParam("message", "Package updated")
                    .toString());
            });
        }
    });
}

module.exports = {
    mount: mount
};
