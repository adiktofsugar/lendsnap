var db = require('../db');
var dbHelpers = require('../db-helpers');
var async = require("async");
var chalk = require("chalk");

module.exports = {
    "invitation": {
        create: "CREATE TABLE IF NOT EXISTS invitation (" +
            "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, " +
            "code VARCHAR(250) NOT NULL, " +
            "from_user_id INT NOT NULL, " +
            "to_user_id INT NOT NULL, " +
            "INDEX (id), " +
            "INDEX (from_user_id), " +
            "INDEX (to_user_id), " +
            "CONSTRAINT UNIQUE (from_user_id, to_user_id), " +
            "CONSTRAINT UNIQUE (code));",
        
        baseData: "INSERT INTO invitation " +
            "(id, code, from_user_id, to_user_id) " +
            "VALUES " +
            "(1, 'abc', 1, 2), " +
            "(2, 'bcd', 2, 1);"
    }
};
