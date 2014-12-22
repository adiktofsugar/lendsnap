var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var Uri = require('jsuri');
var documentPackageService = require('./service');
var accountService = require('../account/service');
var async = require("async");

function mount (app) {
    app.get('/document-package', function (req, res, next) {
        var render = function (error, documentPackages) {
            res.render('document-package/index.html', {
                error: error,
                document_packages: documentPackages
            });
        };
        documentPackageService.getDocumentPackagesByUserId(req.session.userId, render);
    });
    app.get('/document-package/new', function (req, res, next) {
        var render = function (error, documentPackage) {
            if (error) { return next(error); }

            res.render('document-package/package-new.html', {
                document_package_user: req.user,
                document_package: documentPackage,
                documents: []
            });
        };
        req.getUser(function (error, user) {
            if (error) {
                return render(error);
            }
            documentPackageService.createDocumentPackage({
                user_id: user.id,
                banker_user_id: user.is_banker ? user.id : null
            }, render);
        });
    });
    app.route('/document-package/:id')
    .get(function (req, res, next) {
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
            },
            function (user, documentPackage, callback) {
                documentPackageService.getDocumentsByDocumentPackageId(documentPackage.id,
                function (error, documents) {
                    if (error) {
                        return callback(error);
                    }
                    callback(null, user, documentPackage, documents);
                });
            }
        ], function (error, user, documentPackage, documents) {
            if (error) {
                return next(error);
            }
            console.log("documents", documents);
            var documentsByGroupName = {};
            documents.forEach(function (document) {
                if (!documentsByGroupName[document.group_name]) {
                    documentsByGroupName[document.group_name] = [];
                }
                documentsByGroupName[document.group_name].push(document);
            });
            res.render('document-package/package.html', {
                document_package_user: user,
                document_package: documentPackage,
                documents: documents,
                documents_by_group_name: documentsByGroupName
            });
        });
    })
    .post(function (req, res, next) {
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
    });
    app.post('/document-package/:id/document', function (req, res, next) {
        var documentPackageId = req.params.id;
        var userId = req.session.userId;

        var groupName = req.body.group_name;

        var numberFilesUploaded = req.files.length;
        var numberFilesProcessed = 0;
        var newDocumentParametersArray = [];
        req.files.forEach(function (file) {
            var fileKey = userId + '-' + documentPackageId + '-' +
                    file.fieldname + '-' + filename;
            var saveTo = '/var/lendsnap/uploaded/' + fileKey;
            fs.appendFile(saveTo, file.buffer, {flag: 'w'}, function (error) {
                    fileSaved(error, file, saveTo);
                });
        });
        function fileSaved(error, file, saveTo) {
            numberFilesProcessed++;
            if (error) {
                console.error("File was not saved", file.filename, error);
            } else {
                newDocumentParametersArray.push({
                    document_package_id: documentPackageId,
                    group_name: req.body.group_name,
                    name: path.basename(file.filename),
                    path: fileKey
                });
            }
            if (numberFilesProcessed >= numberFilesUploaded) {
                done();
            }
        }
        function done() {
            documentPackageService.createDocuments(newDocumentParametersArray, function (error) {
                var next = req.query.next || '/document-package/' + params.query.id;
                if (error) {
                    return res.redirect(new Uri(next)
                        .addQueryParam('error', String(error))
                        .toString());
                }
                return res.redirect(new Uri(next)
                    .addQueryParam('message', 'Successfully uploaded')
                    .toString());
            });
        }
    });
    app.delete('/document-package/:document_package_id/document/:id', function (req, res, next) {
        documentPackageService.deleteDocumentById(req.params.id,
        function (error, document) {
            if (error) {
                return next(new Error("Couldnt delete document with id " + req.params.id));
            }

            if (req.query.next) {
                return res.redirect(req.query.next);
            }
            res.json({
                status: "ok"
            });
        });
    });
}

module.exports = {
    mount: mount
};
