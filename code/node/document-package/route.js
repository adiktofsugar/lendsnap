var Uri = require('jsuri');
var _ = require('lodash');
var documentPackageService = require('./service');

module.exports = function (router) {
    router.get('/document-package', function (req, res, next) {
        documentPackageService.getDocumentPackagesByUserId(req.user.id, function (error, documentPackages) {
            res.render('document-package/index.html', {
                error: error,
                documentPackages: documentPackages
            });
        });
    });
    router.get('/document-package/new', function (req, res, next) {
        documentPackageService.createDocumentPackage({}, function (error, documentPackage) {
            res.render('document-package/package-new.html', {
                documentPackage: documentPackage
            });
        });
    });
    router.get('/document-package/:id', function (req, res, next) {
        documentPackageService.getPackageById({
            id: req.params.id
        }, function (error, documentPackage) {
            res.render('document-package/package.html', {
                documentPackage: documentPackage
            });
        });
    });

    router.post('/document-package/:id', function (req, res, next) {
        var id = req.params.id;
        documentPackageService.updateDocumentPackage(_.extend(req.body, {
                id: id
            }),
        function (error) {
            if (error) {
                return res.redirect(new Uri('/document-package/' + id)
                    .addQueryParameter("error", error)
                    .toString());
            }
            res.redirect(new Uri('/document-package')
                .addQueryParameter("message", "Package updated")
                .toString());
        });
    });
};
