var db = require('./db');
var crypto = require('crypto');

var encodePassword = function (passwordString) {
    return crypto.createHash('sha1')
        .update(passwordString).digest('hex');
};

function authorize(email, password, callback) {
    db.query("SELECT email, password FROM user WHERE email = ?", [email],
    function (error, rows) {
        if (error) {
            console.error("Error selecting user", error);
            return callback(new Error("Database error"));
        }
        if (!rows.length) {
            return callback(new Error("User doesn't exist"));
        }
        var user = rows[0];
        if (encodePassword(password) !== password) {
            return callback(new Error("Password doesn't match"));
        }
        callback(null, user);
    });
}

module.exports = {
    authorize: authorize
};
