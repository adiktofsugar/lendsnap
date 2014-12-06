var db = require('../db');
var dbHelper = require('../db-helper');
var _ = require('lodash');
var accountService = require('../account/service');

var dbSetup = require('./db-setup');
var DOCUMENT_PACKAGE_FIELDS = dbSetup.DOCUMENT_PACKAGE_FIELDS;
var DOCUMENT_FIELDS = dbSetup.DOCUMENT_FIELDS;

var getDocumentById = function (id, callback) {
    db.query(
        "SELECT * FROM document " + 
        "WHERE id = ?", [id], 
    function (error, rows) {
        if (error) {
            return cb(new Error("Could get document, id - " + id +
                " - error - " + error));
        }
        callback(null, rows[0]);
    });
};
var getDocumentsByDocumentPackageId = function (documentPackageId, callback) {
    db.query(
        "SELECT * FROM document " + 
        "WHERE document_package_id = ?", [documentPackageId], 
    function (error, rows) {
        if (error) {
            return cb(new Error("Could get document list, documentPackageId - " + documentPackageId +
                " - error - " + error));
        }
        callback(null, rows);
    });
};

var getDocumentPackagesByUserId = function (userId, callback) {
    accountService.getUserById(userId, function (error, user) {
        if (error) {
            return callback(new Error("Failed to get user by id - " + error));
        }
        var whereClause = "WHERE user_id=" + db.escape(userId);
        if (user.is_banker) {
            whereClause += " OR banker_user_id=" + db.escape(userId);
        }
        db.query("" +
            "SELECT * FROM document_package " + whereClause,
        function (error, rows) {
            if (error) {
                return cb(new Error("Could get document packages by user id, userId - " + userId +
                    " - error - " + error));
            }
            callback(null, rows);
        });
    });
};
var getDocumentPackageById = function (id, callback) {
    db.query(
        "SELECT * FROM document_package " + 
        "WHERE id = ?", [id], 
    function (error, rows) {
        if (error) {
            return cb(new Error("Could get document package by id, id - " + id +
                " - error - " + error));
        }
        callback(null, rows[0]);
    });
};


var createDocumentPackage = function (parameters, callback) {
    var fields = dbHelper.getFieldsFromParameters(parameters, {
            include: DOCUMENT_PACKAGE_FIELDS
        });
    db.query(
        "INSERT INTO document_package " +
        "(" + fields.names.join(",") + ") " +
        "VALUES " +
        "(" + fields.values.join(",") + ");",
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
var updateDocumentPackage = function (id, parameters, callback) {
    var setStatement = dbHelper.getFieldsFromParameters(parameters, {
            include: DOCUMENT_PACKAGE_FIELDS
        }).setStatement;
    db.query(
        "UPDATE document_package " +
        setStatement + " " +
        "WHERE id=?",
        [id],
        function (error, result) {
            if (error) {
                return callback(new Error("Couldnt update document package - " + error));
            }
            callback(null);
        });
};

module.exports = {
    getDocumentById: getDocumentById,
    getDocumentsByDocumentPackageId: getDocumentsByDocumentPackageId,
    getDocumentPackageById: getDocumentPackageById,
    getDocumentPackagesByUserId: getDocumentPackagesByUserId,
    createDocumentPackage: createDocumentPackage,
    updateDocumentPackage: updateDocumentPackage
};
