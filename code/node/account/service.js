var md5 = require('MD5');
var winston = require('winston');
var db = require('../db');
var dbHelper = require('../db-helper');

var dbSetup = require('./db-setup');
var USER_FIELDS = dbSetup.USER_FIELDS;
var BANK_FIELDS = dbSetup.BANK_FIELDS;


function login (req, userOrEmail, cbOrPassword, cb) {
    var user;
    var password;
    var email;
    if (cb === undefined) {
        cb = cbOrPassword;
        user = userOrEmail;
    } else {
        email = userOrEmail;
        password = cbOrPassword;
    }

    var setCookie = function (user) {
        req.session.userId = user.id;
        winston.info("account.login - user", user.email);
        cb(null, user);
    };

    if (!user) {
        getUserByEmail(email, function (error, user) {
            if (error) return cb(error);
            if (!user) {
                return cb(new Error("No account found."));
            }
            if (user.password != md5(password)) {
                return cb(new Error("Password doesn't match."));
            }
            setCookie(user);
        });
    } else {
        setCookie(user);
    }
}

function logout(req, cb) {
    delete req.session.userId;
    winston.info("account.logout - " + req.user.email);
    cb(null);
}

var userExists = function (email, cb) {
    db.query("SELECT COUNT(id) AS user_count FROM user WHERE email=?",
        [email],
        function (error, rows) {
            cb(error, rows[0].user_count > 0);
        });
};

var getUserById = function (id, cb) {
    db.query("SELECT * FROM user WHERE id=?", [id], function (error, rows) {
        if (error) {
            return cb(new Error("Failed select by id " + id + " - " + error));
        }
        cb(null, rows[0]);
    });
};
var getUserByEmail = function (email, cb) {
    db.query("SELECT * FROM user WHERE email=?", [email], function (error, rows) {
        if (error) {
            return cb(new Error("Failed to select by email " + email + " - " + error));
        }
        cb(null, rows[0]);
    });
};
var register = function (email, password, cb) {
    userExists(email, function (err, exists) {
        if (err) return cb(err);
        if (exists) {
            cb(new Error("User with email " + email + " already exists."));
        } else {
            db.query("" +
                "INSERT INTO user " +
                "(email, password) " +
                "VALUES " +
                "(?, ?)",
                [email, md5(password)],
                function (error, result) {
                    if (error) {
                        return cb(error);
                    }
                    getUserById(result.insertId, function (error, user) {
                        cb(error, user);
                    });
                });
        }
    });
};

var setPassword = function (email, password, cb) {
    if (!password) {
        return cb(new Error("Password must be set."));
    }
    getUserByEmail(email, function (error, user) {
        if (error) return cb(error);

        db.query("" +
            "UPDATE user SET password = ? WHERE id = ?",
            [md5(password), user.id],
            function (error, rows) {
                cb(error, user);
            });
    });
};

var updateUser = function (userId, attributes, cb) {
    var setStatement = dbHelper.getFieldsFromParameters(attributes, {
            include: USER_FIELDS
        }).setStatement;
    
    db.query("" +
        "UPDATE user " + setStatement + " " +
        "WHERE id = ?",
        [userId],
        function (error, rows) {
            cb(error, user);
        });
};

module.exports = {
    login: login,
    logout: logout,
    register: register,
    setPassword: setPassword,
    getUserById: getUserById,
    getUserByEmail: getUserByEmail,
    updateUser: updateUser
};
