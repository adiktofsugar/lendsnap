var async = require('async');
var db = require('./db');

function inspectTable (tableName, callback) {
    var fields = [];
    var indices = [];

    var inspection = {
        columns: [],
        indices: [],
        rowCount: 0
    };
    async.series([getColumns, getIndices, getRowCount],
    function (error) {
        if (error && error.code == "ER_NO_SUCH_TABLE") {
            return callback(null, inspection);
        }
        if (error) {
            return callback(error);
        }
        callback(null, inspection);
    });
    

    function getColumns(callback) {
        db.query("SHOW COLUMNS FROM " + tableName, function (error, rows) {
            if (error) {
                return callback(error);
            }
            inspection.columns = rows;
            callback();
        });
    }

    function getIndices(callback) {
        db.query("SHOW INDEX FROM " + tableName, function (error, rows) {
            if (error) {
                return callback(error);
            }
            inspection.indices = rows;
            callback();
        });
    }
    function getRowCount(callback) {
        var firstColumn = inspection.columns[0];
        db.query("SELECT COUNT(" + firstColumn.Field + ") AS num_rows FROM " + tableName,
        function (error, rows) {
            if (error) {
                return callback(error);
            }
            inspection.rowCount = parseInt(rows[0].num_rows, 10);
            callback();
        });
    }
}

var getColumnDefinition = function (column) {
    var definition = column.dataType + " " +
        (column.notNull ? "NOT NULL " : "NULL" + " ") +
        (column.default ? "DEFAULT '" + column.default + "' " : '') + 
        (column.autoIncrement ? "AUTO_INCREMENT " : '');
    return definition.replace(/\s+$/, '');
};
var getIndexDefinition = function (index) {
    return "(" + index.columnNames.join(',') + ")";
};

var getConstraintDefinition = function (constraint) {
    return (constraint.isUnique ? "UNIQUE INDEX " : '') +
        (constraint.isPrimary? "PRIMARY KEY " : '') +
        "(" + constraint.columnNames.join(',') + ")";
};

function buildTableQuery(tableName, tableDefinition, inspection) {
    var getCreateTableQuery = function () {
        var query = "CREATE TABLE " + tableName + " (";
        tableDefinition.columns.forEach(function (column) {
            query += column.name + " " + getColumnDefinition(column) + ",";
        });
        tableDefinition.indices.forEach(function (index) {  
            query += "INDEX " + getIndexDefinition(index) + ",";
        });
        tableDefinition.constraints.forEach(function (constraint) {
            query += "CONSTRAINT " + getConstraintDefinition(constraint) + ",";
        });
        query = query.replace(/,$/, '');
        query += ")";
        return query;
    };
    var getAlterTableQuery = function (inspection) {
        var columnNamesToModify = {};
        tableDefinition.columns.forEach(function (column) {
            inspection.columns.forEach(function (existingColumn) {
                if (existingColumn.Field == column.name) {
                    columnNamesToModify[column.name] = 1;
                }
            });
        });
        var indexKeysToDrop = {};
        tableDefinition.indices.concat(tableDefinition.constraints).forEach(function (index) {
            var indexKey = index.name || index.columnNames[0];
            if (index.isPrimary) {
                indexKey = 'PRIMARY';
            }
            inspection.indices.forEach(function (index) {
                if (index.Key_name == indexKey) {
                    indexKeysToDrop[indexKey] = 1;
                }
            });
        });
        
        var query = "ALTER TABLE " + tableName + " ";
        Object.keys(indexKeysToDrop).forEach(function (indexKey) {
            if (indexKey == 'PRIMARY') {
                query += "DROP PRIMARY KEY, ";
            } else {
                query += "DROP INDEX " + indexKey + ', ';
            }
        });

        inspection.columns.forEach(function (existingColumn) {
            if (!columnNamesToModify[existingColumn.Field]) {
                query += "DROP COLUMN " + existingColumn.Field + ", ";
            }
        });

        tableDefinition.columns.forEach(function (column, columnIndex) {
            var previousColumn = tableDefinition.columns[columnIndex - 1];
            var needsToModify = Boolean(columnNamesToModify[column.name]);
            var statement = (needsToModify ? "MODIFY" : "ADD") + " COLUMN " +
                column.name + " " + getColumnDefinition(column) + " " +
                (previousColumn ? "AFTER " + previousColumn.name : "FIRST");
            query += statement + ', ';
        });

        tableDefinition.indices.forEach(function (index) {
            query += "ADD INDEX " + getIndexDefinition(index) + ", ";
        });
        tableDefinition.constraints.forEach(function (constraint) {
            query += "ADD CONSTRAINT " + getConstraintDefinition(constraint) + ", ";
        });

        return query.replace(/,\s+$/, '');
    };
    return (inspection.columns.length <= 0) ? getCreateTableQuery() 
        : getAlterTableQuery(inspection);
}

function getQueriesForTable(tableName, tableDefinition, callback) {
    var tableQueryStrings = [];
    inspectTable(tableName, function (error, inspection) {
        if (error) {
            return callback(error);
        }
        var tableQuery = buildTableQuery(tableName, tableDefinition, inspection);
        tableQueryStrings.push(tableQuery);

        if (inspection.rowCount <= 0) {
            tableDefinition.baseData.forEach(function (dataField) {
                var setValue = "";
                Object.keys(dataField).forEach(function (dataFieldName) {
                    setValue += dataFieldName + "='" + dataField[dataFieldName] + "', ";
                });
                setValue = setValue.replace(/,\s+$/, '');
                tableQueryStrings.push("INSERT INTO " + tableName + " SET " + setValue);
            });
        }
        callback(null, tableQueryStrings);
    });
}
module.exports = {
    getQueriesForTable: getQueriesForTable,
    buildTableQuery: buildTableQuery,
    inspectTable: inspectTable
};
