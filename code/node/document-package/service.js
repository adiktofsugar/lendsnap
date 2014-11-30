var db = require('../db');
var _ = require('lodash');

var dbSetup = require('./db-setup');
var DOCUMENT_PACKAGE_FIELDS = dbSetup.DOCUMENT_PACKAGE_FIELDS;
var DOCUMENT_FIELDS = dbSetup.DOCUMENT_FIELDS;

var getDocument = function (parameters, callback) {
    db.query(
        "SELECT * FROM document " + 
        "WHERE id = ?", [parameters.id], 
    function (error, rows) {
        if (error) {
            return cb(new Error("Could get document, parameters - " + parameters +
                " - error - " + error));
        }
        callback(null, rows[0]);
    });
};
var getDocuments = function (parameters, callback) {
    db.query(
        "SELECT * FROM document " + 
        "WHERE document_package_id = ?", [parameters.documentPackageId], 
    function (error, rows) {
        if (error) {
            return cb(new Error("Could get document list, parameters - " + parameters +
                " - error - " + error));
        }
        callback(null, rows);
    });
};

var getDocumentPackagesByUserId = function (parameters, callback) {
    db.query("" +
        "SELECT * FROM document_package WHERE user_id=?",
        [parameters.userId],
    function (error, rows) {
        if (error) {
            return cb(new Error("Could get document packages by user id, parameters - " + parameters +
                " - error - " + error));
        }
        callback(null, rows);
    });
};
var getDocumentPackageById = function (parameters, callback) {
    if (!parameters.id) {
        return callback(new Error("No id passed"));
    }
    db.query(
        "SELECT * FROM document_package " + 
        "WHERE id = ?", [parameters.id], 
    function (error, rows) {
        if (error) {
            return cb(new Error("Could get document package by id, parameters - " + parameters +
                " - error - " + error));
        }
        callback(null, rows[0]);
    });
};

var getFieldsFromParameters = function (parameters, options) {
    var fieldsToInclude = options.include || null;
    var fieldsToExclude = options.exclude || [];
    
    var fieldNames = [];
    var fieldValues = [];

    var fieldName;
    var fieldValue;
    for (fieldName in parameters) {
        if (parameters.hasOwnProperty(fieldName)) {
            fieldValue = parameters[fieldName];
            if (fieldsToExclude.indexOf(fieldName) <= -1) {
                if (fieldsToInclude === null || fieldsToInclude.indexOf(fieldName) > -1) {
                    fieldNames.push(fieldName);
                    fieldValues.push(db.escape(fieldValue));
                }
            }
        }
    }
    return {
        names: fieldNames,
        values: fieldValues
    };
};

var createDocumentPackage = function (parameters, callback) {
    var fields = getFieldsFromParameters(parameters, {include: DOCUMENT_PACKAGE_FIELDS});
    db.query(
        "INSERT INTO document_package " +
        "(" + fields.names.join(",") + ") " +
        "VALUES " +
        "(" + fields.values.join(",") + ");",
    function (error, result) {
        if (error) {
            return callback(new Error("Couldn't create document package - " + error));
        }
        getDocumentPackageById({id: result.insertId}, function (error, documentPackage) {
            if (error) {
                return callback(new Error("Couldn't get package by id " + result.insertId +
                    " - " + error));
            }
            callback(null, documentPackage);
        });
    });
};
var updateDocumentPackage = function (parameters, callback) {
    console.log("update document_package", parameters);
    var fields = getFieldsFromParameters(parameters, {include: DOCUMENT_PACKAGE_FIELDS});
    var setStatement = "";
    _.each(fields.names, function (name, index) {
        setStatement += name + "=" + fields.values[index] + " ";
    });
    db.query(
        "UPDATE document_package " +
        "SET " + setStatement +
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
