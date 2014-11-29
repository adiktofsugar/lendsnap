var db = require('../db');
var _ = require('lodash');

var getDocument = function (parameters, callback) {
    db.query(
        "SELECT * FROM document " + 
        "WHERE id = ?", [parameters.id], 
    function (error, results) {
        callback(error, results);
    });
};
var getDocuments = function (parameters, callback) {
    db.query(
        "SELECT * FROM document " + 
        "WHERE document_package_id = ?", [parameters.documentPackageId], 
    function (error, results) {
        callback(error, results);
    });
};

var getDocumentPackagesByUserId = function (parameters, callback) {
    db.query("" +
        "SELECT * FROM document_package WHERE user_id=?",
        [parameters.userId],
    function (error, rows) {
        callback(error, rows);
    });
};
var getDocumentPackageById = function (parameters, callback) {
    db.query(
        "SELECT * FROM document_package " + 
        "WHERE id = ?", [parameters.id], 
    function (error, results) {
        callback(error, results);
    });
};
var createDocumentPackage = function (parameters, callback) {
    var insertFieldNames = [];
    var insertFieldValues = [];
    _.each(parameters, function (insertFieldValue, insertFieldName) {
        insertFieldNames.push(insertFieldName);
        insertFieldValues.push(db.escape(insertFieldValue));
    });
    db.query(
        "INSERT INTO document_package " +
        "(" + insertFieldNames.join(",") + ") " +
        "VALUES " +
        "(" + insertFieldValues.join(",") + ");",
    function (error, result) {
        if (error) {
            return callback(new Error("Couldn't create document package - " + error));
        }
        getDocumentPackageById(result.insertId, function (error, documentPackage) {
            if (error) {
                return callback(new Error("Couldn't get package by id " + result.insertId +
                    " - " + error));
            }
            callback(null, documentPackage);
        });
    });
};
var updateDocumentPackage = function (parameters, callback) {
    var updateFieldNames = [];
    var updateFieldValues = [];
    _.each(parameters, function (fieldValue, fieldName) {
        updateFieldNames.push(fieldName);
        updateFieldValues.push(db.escape(fieldValue || null));
    });
    db.query(
        "UPDATE document_package " +
        "(" + updateFieldNames.join(",") + ") " + 
        "VALUES " +
        "(" + updateFieldValues.join(",") + ") " +
        "WHERE id=?",
        [parameters.id],
        function (error, result) {
            if (error) {
                return callback(new Error("Couldnt update document package - " + error));
            }
            callback(null);
        });
};

module.exports = {
    getDocumentById: getDocument,
    getDocuments: getDocuments,
    getDocumentPackageById: getDocumentPackageById,
    getDocumentPackagesByUserId: getDocumentPackagesByUserId,
    createDocumentPackage: createDocumentPackage,
    updateDocumentPackage: updateDocumentPackage
};
