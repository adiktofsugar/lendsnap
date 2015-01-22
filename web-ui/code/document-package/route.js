var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var Uri = require('jsuri');
var documentPackageService = require('./service');
var async = require("async");
var config = require('../config');
var request = require('request');
var Uri = require('jsuri');
var mv = require('mv');
var path = require('path');

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
                var accountService = config.getJson('/services/account');
                request.get(new Uri('http://' + accountService.address)
                    .setPath('/account/' + documentPackage.user_id).toString(),
                function (error, response, user) {
                    if (error) {
                        return callback(error);
                    }
                    if (response.statusCode.toString().match(/^(4|5)/)) {
                        console.error("Bad request to account service", "response", response, "body", body);
                        return callback(new Error("Bad request to account service."));
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
            documents = documents.map(function (document) {
                return _.extend(document, {
                    name: path.basename(document.path)
                });
            });
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
                    var accountService = config.getJson('/services/account');
                    request.get(new Uri('http://' + accountService.address)
                        .setPath('/account')
                        .addQueryParam(email, userEmail)
                        .toString(), function (error, response, user) {
                            if (error) {
                                return callback(error);
                            }
                            callback(null, user);
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

        function processFile(file, callback) {
            var fileKey = userId + '-' + documentPackageId + '-' +
                    file.fieldname + '-' + file.originalname;
            var saveTo = '/var/lendsnap/uploaded/' + fileKey;

            var error;
            console.log("path", file.path);
            console.log("buffer", file.buffer);
            fs.createReadStream(file.path).pipe(fs.createWriteStream(saveTo))
            .on("error", function (error) {
                console.error("process file rename", file.originalname, error);
                error = new Error("Couldnt process " + file.originalname);
            })
            .on("finish", function () {
                if (error) {
                    callback(error);
                } else {
                    callback(null, {
                        multerFile: file,
                        path: fileKey
                    });
                }
            });
        }
        var files = req.files["file[]"];
        if (!(files instanceof Array)) {
            files = [files];
        }
        console.log("files", files);
        var processFileFunctions = files.map(function (file) {
            return function (callback) {
                processFile(file, callback);
            };
        });
        var next = req.query.next || '/document-package/' + params.query.id;
        async.parallel(processFileFunctions, function (error, processedFiles) {
            if (error) {
                return res.redirect(new Uri(next)
                    .addQueryParam('error', String(error))
                    .toString());
            }
            var groupName = req.body.group_name;
            var documentParametersArray = processedFiles.map(function (processedFile) {
                return {
                    document_package_id: documentPackageId,
                    group_name: req.body.group_name,
                    path: processedFile.path
                };
            });
            documentPackageService.createDocuments(documentParametersArray, function (error) {
                if (error) {
                    console.error("couldnt create documents", error);
                    return res.redirect(new Uri(next)
                        .addQueryParam('error', String(error))
                        .toString());
                }
                return res.redirect(new Uri(next)
                    .addQueryParam('message', 'Successfully uploaded')
                    .toString());
            });
        });
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
