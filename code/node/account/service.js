var md5 = require('MD5');
var winston = require('winston');
var db = require('../db');

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
        cb(error, rows[0]);
    });
};
var getUserByEmail = function (email, cb) {
    db.query("SELECT * FROM user WHERE email=?", [email], function (error, rows) {
        cb(error, rows[0]);
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

var updateUser = function (user, attributes, cb) {
    var updateFields = [];
    var updateValues = [];
    _.each(attributes, function (attributeValue, attributeName) {
        updateFields.push(attributeName);
        updateFields.push(db.escape(attributeValue));
    });
    db.query("" +
        "UPDATE user (" + updateFields.join(",") + ")" + 
        "VALUES (" + updateValues.join(",") + ") " +
        "WHERE id = ?",
        [user.id],
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
    update: updateUser
};
