var md5 = require('MD5');
var winston = require('winston');

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
            if (user.get("password") != md5(password)) {
                return cb(new Error("Password doesn't match."));
            }
            setCookie(user);
        });
    } else {
        setCookie(user);
    }
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
var getUser = function (queryParams, cb) {
    db.User.find({
        where: queryParams
    })
    .then(function (user) {
        cb(null, user);
    }, function (error) {
        cb(error);
    });
};
var getUserById = function (id, cb) {
    getUser({id: id}, cb);
};
var getUserByEmail = function ( email, cb) {
    getUser({email: email}, cb);
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

var setPassword = function (email, password, cb) {
    if (!password) {
        return cb(new Error("Password must be set."));
    }
    getUserByEmail(email, function (error, user) {
        if (error) return cb(error);

        user.set("password", md5(password));
        user.save()
        .then(function () {
            cb();
        }, cb);
    });
};

var updateUser = function (user, attributes, cb) {
    user.set(attributes)
    .save()
    .then(function (user) {
        cb(null, user);
    }, cb);
};

module.exports = {
    login: login,
    logout: logout,
    hasPermission: hasPermission,
    register: register,
    setPassword: setPassword,
    getUserById: getUserById,
    getUserByEmail: getUserByEmail,
    update: updateUser
};
