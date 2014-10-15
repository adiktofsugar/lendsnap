var md5 = require('MD5');
var winston = require('winston');
var db = require('../db');

function login (req, email, password, cb) {
    db.User.find({
        where: {
            email: email,
            password: md5(password)
        }
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


var hasPermission = function (user, permissionName, otherPermissionInfo, cb) {
    if (cb === undefined) {
        cb = otherPermissionInfo;
        otherPermissionInfo = undefined;
    }
    user.getPermissions({
        where: {
            name: permissionName
        }
    })
    .then(function (permissions) {
        var permission = permissions[0];
        if (!permission) {
            winston.info("Permission doesn't exist for user",
                permissionName, user.id, user.email);
            
            return cb(new Error("User doesn't have " + permissionName + " permission."));
        }
        permission.has(otherPermissionInfo, function (error, result) {
            if (error) {
                cb(error);
            } else if (!result) {
                winston.info("Permission.has returned false",
                    permissionName, user.id, user.email);
                cb(new Error("User doesn't have " + permissionName + " permission."));
            } else {
                cb(null);
            }
        });
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
var getUser = function (req, queryParams, cb) {
    db.User.find({
        where: queryParams
    })
    .then(function (user) {
        cb(null, user);
    }, function (error) {
        cb(error);
    });
};
var getUserById = function (req, id, cb) {
    getUser(req, {id: id}, cb);
};
var getUserByEmail = function (req, email, cb) {
    getUser(req, {email: email}, cb);
};
var register = function (email, password, cb) {
    userExists(email, function (err, exists) {
        if (err) return cb(err);
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
    hasPermission: hasPermission,
    register: register,
    getUserById: getUserById,
    getUserByEmail: getUserByEmail
};
