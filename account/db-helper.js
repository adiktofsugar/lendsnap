var db = require('./db');

var getExistingTables = function (cb) {
    db.query("SHOW TABLES", function (error, results) {
        if (error) return cb(error);
        var tableNames = results.map(function (row) {
            var key = Object.keys(row)[0];
            return row[key];
        });
        cb(null, tableNames);
    });
};
var getTablesWithNames = function (tableNames, cb) {
    if (!(tableNames instanceof Array)) {
        cb(new Error("tableNames should be an array"));
        return;
    }
    getExistingTables(function (error, existingTableNames) {
        if (error) {
            return cb(error);
        }
        cb(null, existingTableNames.filter(function (tableName) {
            return tableNames.indexOf(existingTableName) > -1;
        }));
    });
};

var getFieldsFromParameters = function (parameters, options) {
    var fieldsToInclude = options.include || null;
    var fieldsToExclude = options.exclude || [];
    
    var setStatement = "";
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
                    fieldValues.push(fieldValue);
                    setStatement += ", `" + fieldName + "`= ?";
                }
            }
        }
    }
    return {
        names: fieldNames,
        values: fieldValues,
        setStatement: "SET" + setStatement.slice(1),
        valuesQuestionMarks: fieldValues.map(function () { return '?'; })
    };
};

module.exports = {
    getExistingTables: getExistingTables,
    getTablesWithNames: getTablesWithNames,
    getFieldsFromParameters: getFieldsFromParameters
};
