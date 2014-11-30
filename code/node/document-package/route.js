var _ = require('lodash');
var Uri = require('jsuri');
var documentPackageService = require('./service');

function mount (app) {
    app.router.addRoute('/document-package', function (req, res, next) {
        documentPackageService.getDocumentPackagesByUserId({
                userId: req.user.id
            },
        function (error, documentPackages) {
            res.render('document-package/index.html', {
                error: error,
                documentPackages: documentPackages
            });
        });
    });
    app.router.addRoute('/document-package/new', function (req, res, next) {
        documentPackageService.createDocumentPackage({
                user_id: req.user.id
            },
        function (error, documentPackage) {
            if (error) { return next(error); }
            res.render('document-package/package-new.html', {
                documentPackage: documentPackage
            });
        });
    });
    app.router.addRoute('/document-package/:id', function (req, res, next) {
        if (req.method == "GET") {
            documentPackageService.getDocumentPackageById({
                    id: req.params.id
                },
            function (error, documentPackage) {
                res.render('document-package/package.html', {
                    documentPackage: documentPackage
                });
            });
        } else if (req.method == "POST") {
            var id = req.params.id;
            documentPackageService.updateDocumentPackage(_.extend(req.body, {
                    id: id
                }),
            function (error) {
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
