var db = require('./models');
var md5 = require('MD5');
var winston = require('winston');

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
            winston.info("account.login - user", user.toJSON());
            cb(null, user);
        }
    }, function (error) {
        cb(error);
    });
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
    register: register
};
