var documentService = require('./service');

module.exports = function (router) {
    router.get('/document-package/:id', function (req, res, next) {
        documentService.getPackageById({
            id: req.params.id
        }, function (error, documentPackage) {
            res.render('document/package-index.html', {
                documentPackage: documentPackage
            });
        });
    });
};
