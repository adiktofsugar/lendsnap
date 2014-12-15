var md5 = require("MD5");
var async = require("async");
var chalk = require("chalk");


var manyToMany = function (t1, t2) {
    return "CREATE TABLE IF NOT EXISTS " + t1 + "_" + t2 + "(" +
        t1 + "_id INT NOT NULL, " +
        t2 + "_id INT NOT NULL, " +
        "INDEX (" + t1 + "_id), " +
        "INDEX (" + t2 + "_id));";
};

module.exports = {
    USER_FIELDS: ['email', 'first_name', 'last_name', 'password'],
    "user": {
        create: "CREATE TABLE IF NOT EXISTS user (" +
            "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, " +
            "email VARCHAR(250) NOT NULL, " +
            "first_name VARCHAR(250), " +
            "last_name VARCHAR(250), " +
            "password VARCHAR(250), " +
            "is_banker TINYINT(1) DEFAULT 0, " +
            "is_admin TINYINT(1) DEFAULT 0, " +
            "INDEX (id), " +
            "INDEX (email), " +
            "CONSTRAINT UNIQUE (email));",
        baseData: "INSERT INTO user " +
            "(id, email, first_name, last_name, password, is_banker, is_admin) " + 
            "VALUES " + 
            "(1, 'user1@example.org', 'Charles', 'Awesome', '" + md5("a") + "', 0, 0), " +
            "(2, 'user2@example.org', 'The', 'Banker', '"+ md5("a") + "', 1, 0), " +
            "(3, 'admin@lendsnap.com', 'Super', 'Admin', '" + md5("admin") + "', 0, 1);"
    },
    BANK_FIELDS: ['name'],
    "bank": {
        create: "CREATE TABLE IF NOT EXISTS bank (" +
            "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, " +
            "name VARCHAR(250) NOT NULL, " +
            "INDEX (id), " +
            "INDEX (name), " +
            "CONSTRAINT UNIQUE (name));",
        baseData: "INSERT INTO bank " +
            "(id, name)" + 
            "VALUES " + 
            "(1, 'Wells Fargo');"
    },
    "user_bank": {
        create: manyToMany("user", "bank"),
        baseData: "INSERT INTO user_bank " +
            "VALUES " +
            "(2, 1)"
    }
};
