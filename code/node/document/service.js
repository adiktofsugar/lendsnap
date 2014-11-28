var db = require('../db');

var getDocument = function (parameters) {
    db.query(
        "SELECT * FROM document " + 
        "WHERE id = ?", [parameters.id], 
    function (error, results) {
        callback(error, results);
    });
};
var getDocuments = function (parameters) {
    db.query(
        "SELECT * FROM document " + 
        "WHERE document_package_id = ?", [parameters.documentPackageId], 
    function (error, results) {
        callback(error, results);
    });
};

var getDocumentPackageById = function (parameters) {
    db.query(
        "SELECT * FROM document_package " + 
        "WHERE id = ?", [parameters.id], 
    function (error, results) {
        callback(error, results);
    });
};

module.exports = {
    getDocumentById: getDocument,
    getDocuments: getDocuments,
    getDocumentPackageById: getDocumentPackageById
};
