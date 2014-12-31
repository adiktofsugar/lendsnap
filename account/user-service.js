var db = require('./db');
var dbHelper = require('./db-helper');
var dbDefinition = require('./db-definition');
var crypto = require('crypto');

var getUserById = function (id, cb) {
    db.query("SELECT * FROM user WHERE id=?", [id], function (error, rows) {
        if (error) {
            console.error("Error getting user by id", "id", id, "error", error);
            return cb(new Error("Failed select by id " + id));
        }
        cb(null, rows[0]);
    });
};

var encodePassword = function (passwordString) {
    return crypto.createHash('sha1')
        .update(passwordString).digest('hex');
};

var createUser = function (attributes, cb) {
    if (!attributes) {
        return cb(null);
    }
    var password = attributes.password;
    if (password) {
        attributes.password = encodePassword(password);
    }
    var setStatement = dbHelper.getFieldsFromParameters(attributes, {
            include: dbDefinition.getEditableFieldNames("user")
        }).setStatement;
    
    db.query("" +
        "INSERT INTO user " + setStatement,
        function (error, result) {
            if (error) {
                console.error("Error inserting user", error, "fields", attributes, "result", result);
                return cb(error);
            }
            var id = result.insertId;
            if (!id) {
                console.error("No insert id.", "result", result);
                return cb(new Error("Nothing was inserted"));
            }
            getUserById(id, function (error, user) {
                if (error) {
                    return cb(new Error("Couldn't get user by id", id));
                }
                cb(null, user);
            });
        });
};


var updateUserById = function (userId, attributes, cb) {
    if (!attributes) {
        return cb(null);
    }
    var password = attributes.password;
    if (password) {
        attributes.password = encodePassword(password);
    }
    var setStatement = dbHelper.getFieldsFromParameters(attributes, {
            include: USER_FIELDS
        }).setStatement;
    
    db.query("UPDATE user " + setStatement + " WHERE id = ?",
        [userId],
        function (error, user) {
            cb(error, user);
        });
};

module.exports = {
    getUserById: getUserById,
    updateUserById: updateUserById,
    createUser: createUser
};
