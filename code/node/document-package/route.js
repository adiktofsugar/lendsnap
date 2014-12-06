var fs = require('fs');
var _ = require('lodash');
var Uri = require('jsuri');
var documentPackageService = require('./service');
var accountService = require('../account/service');
var async = require("async");
var Busboy = require('busboy');

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
                document_package: documentPackage,
                documents: []
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
                res.render('document-package/package.html', {
                    document_package_user: user,
                    document_package: documentPackage,
                    documents: documents
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
    app.router.addRoute('/document-package/:id/document', function (req, res, next) {
        var documentPackageId = req.params.id;
        var userId = req.user.id;

        if (req.method == "POST") {
            
            var busboy = new Busboy({
                headers: req.headers
            });
            var filesUploaded = {};
            busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
                console.log('File [' + fieldname + ']: filename: ' + filename);
                var fileKey = userId + '-' + documentPackageId + '-' +
                        fieldname + '-' + filename;
                var saveTo = '/var/lendsnap/uploaded/' + fileKey;
                filesUploaded[fileKey] = {
                    filename: filename,
                    fieldname: fieldname,
                    saveTo: saveTo
                };
                var outputFile = fs.createWriteStream(saveTo);
                file.pipe(outputFile);
                outputFile.on('error', function(error) {
                    console.log('File [' + fileKey + '] Error - ', error);
                });
            });
            busboy.on('finish', function() {
                console.log('Done parsing form!');
                var newDocumentParametersArray = _.map(filesUploaded, function (fileUploaded) {
                        return {
                            document_package_id: documentPackageId,
                            group_name: fileUploaded.fieldname,
                            name: fileUploaded.filename,
                            path: fileUploaded.saveTo
                        };
                    });
                console.log("createDocuments", newDocumentParametersArray);
                documentPackageService.createDocuments(newDocumentParametersArray,
                function (error, newDocuments) {
                    if (error) {
                        return next(new Error("Could not create documents - " + error));
                    }
                    if (req.query.next) {
                        return res.redirect(req.query.next);
                    }
                    res.json({
                        status: "ok",
                        filesUploaded: filesUploaded,
                        newDocuments: newDocuments
                    });
                });
            });
            req.pipe(busboy);
        } else {
            res.writeHead(404);
            res.end();
        }
    });
    app.router.addRoute('/document-package/:document_package_id/document/:id', function (req, res, next) {
        if (req.method == "DELETE") {
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
        } else {
            res.writeHead(404);
            res.end();
        }
    });
}

module.exports = {
    mount: mount
};
