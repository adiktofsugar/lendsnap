var db = require('../db');
var dbHelper = require('../db-helper');
var _ = require('lodash');
var async = require("async");
var config = require('../config');
var request = require('request');
var Uri = require('jsuri');

var dbDefinition = require('../db-definition');
var DOCUMENT_PACKAGE_FIELDS = dbDefinition.getEditableFieldNames('document_package');
var DOCUMENT_FIELDS = dbDefinition.getEditableFieldNames('document');

var getDocumentById = function (id, callback) {
    db.query(
        "SELECT * FROM document " + 
        "WHERE id = ?", [id], 
    function (error, rows) {
        if (error) {
            return callback(new Error("Could get document, id - " + id +
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
            return callback(new Error("Could get document list, documentPackageId - " + documentPackageId +
                " - error - " + error));
        }
        callback(null, rows);
    });
};

var createDocument = function (parameters, callback) {
    var fields = dbHelper.getFieldsFromParameters(parameters, {
            include: DOCUMENT_FIELDS
        });
    if (!parameters.document_package_id) {
        return callback(new Error("No document_package_id given."));
    }
    if (!parameters.path) {
        return callback(new Error("No path given."));
    }
    db.query(
        "INSERT INTO document " +
        "(" + fields.names.join(",") + ") " +
        "VALUES " +
        "(" + fields.valuesQuestionMarks.join(",") + ");", fields.values,
    function (error, result) {
        if (error) {
            return callback(new Error("Couldn't create document - " + error));
        }
        getDocumentById(result.insertId, function (error, document) {
            if (error) {
                return callback(new Error("Couldn't get document by id " + result.insertId +
                    " - " + error));
            }
            callback(null, document);
        });
    });
};
var updateDocument = function (id, parameters, callback) {
    var fields = dbHelper.getFieldsFromParameters(parameters, {
            include: DOCUMENT_FIELDS
        });
    db.query(
        "UPDATE document " +
        fields.setStatement + " " +
        "WHERE id=?",
        fields.values.concat(id),
        function (error, result) {
            if (error) {
                return callback(new Error("Couldnt update document - " + error));
            }
            callback(null);
        });
};
var deleteDocumentById = function (id, callback) {
    db.query(
        "DELETE FROM document WHERE id=?", [id],
        function (error, result) {
            if (error) {
                return callback(new Error("Couldnt delete document - " + error));
            }
            callback(null);
        });
};

var createDocuments = function (documentParametersArray, callback) {
    var documentCreateFunctions = documentParametersArray.map(function (parameters) {
        return function (lastMethodsDocuments, callback) {
            if (!callback) {
                callback = lastMethodsDocuments;
                lastMethodsDocuments = [];
            }
            var thisMethodsDocuments = lastMethodsDocuments.slice();
            createDocument(parameters, function (error, newDocument) {
                if (error) {
                    return callback(error, thisMethodsDocuments);
                }
                thisMethodsDocuments.push(newDocument);
                callback(null, thisMethodsDocuments);
            });
        };
    });
    async.waterfall(documentCreateFunctions, function (error, createdDocuments) {
        if (error) {
            console.error("Errors creating documents", error);
            console.error("-- created documents", createdDocuments);
            return callback(error, createDocuments);
        }
        callback(null, createdDocuments);
    });
};

var getDocumentPackagesByUserId = function (userId, callback) {
    var accountService = config.getJson('/services/account');
    if (!accountService) {
        return callback(new Error("Account service down"));
    }
    request.get(new Uri('http://' + accountService.address)
        .setPath('/account/' + userId)
        .toString(),
    function (error, response, user) {
        if (error) {
            return callback(new Error("Failed to get user by id - " + error));
        }
        if (response.statusCode.toString().match(/^4/)) {
            console.error("Bad request to account service", "response", response, "body", body);
            return callback(new Error("Bad request to account service"));
        } 
        var queryArguments = [];
        var whereClause = "WHERE user_id=?";
        queryArguments.push(userId);
        if (user.is_banker) {
            whereClause += " OR banker_user_id=?";
            queryArguments.push(userId);
        }
        db.query("SELECT * FROM document_package " + whereClause, queryArguments,
        function (error, rows) {
            if (error) {
                return callback(new Error("Could get document packages by user id, userId - " + userId +
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
            return callback(new Error("Could get document package by id, id - " + id +
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
        "(" + fields.valuesQuestionMarks.join(",") + ");", fields.values,
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
    var fields = dbHelper.getFieldsFromParameters(parameters, {
            include: DOCUMENT_PACKAGE_FIELDS
        });
    db.query(
        "UPDATE document_package " +
        fields.setStatement + " " +
        "WHERE id=?",
        fields.values.concat([id]),
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
    createDocument: createDocument,
    updateDocument: updateDocument,
    deleteDocumentById: deleteDocumentById,
    createDocuments: createDocuments,
    
    getDocumentPackageById: getDocumentPackageById,
    getDocumentPackagesByUserId: getDocumentPackagesByUserId,
    createDocumentPackage: createDocumentPackage,
    updateDocumentPackage: updateDocumentPackage
};
