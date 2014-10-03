var md5 = require('MD5');
var winston = require('winston');
var db = require('../db');

function login (req, email, password, cb) {
    db.User.find({
        email: email,
        password: md5(password)
    })
    .then(function (user) {
        if (!user) {
            cb(new Error("No account found."));
        } else {
            req.session.userId = user.id;
            winston.info("account.login - user", user.email);
            cb(null, user);
        }
    }, function (error) {
        cb(error);
    });
};

function logout(req, cb) {
    delete req.session.userId;
    winston.info("account.logout - " + req.user.email);
    cb(null);
};

var userExists = function (email, cb) {
    db.User.count({
        email: email
    })
    .then(function (count) {
        cb(null, count);
    }, function (err) {
        cb(err);
    });
};
function register (email, password, cb) {
    userExists(email, function (err, exists) {
        if (err) throw err;
        if (exists) {
            cb(new Error("User with email " + email + " already exists."));
        } else {
            db.User.create({
                email: email,
                password: md5(password)
            })
            .then(function (result) {
                cb(null, result);
            }, function (error) {
                cb(error);
            });
        }
    });
};

module.exports = {
    login: login,
    logout: logout,
    register: register
};
