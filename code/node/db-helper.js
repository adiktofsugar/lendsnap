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

module.exports = {
    getExistingTables: getExistingTables,
    getTablesWithNames: getTablesWithNames
};
