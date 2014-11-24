var db = require('../db');
var Hashids = require("hashids");
var winston = require("winston");

var getInviteByCode = function (code, cb) {
    db.Invite.find({
        where: {
            code: code
        }
    })
    .then(function (result) {
        cb(null, result);
    }, function (error) {
        cb(error);
    });
};
var getInviteByEmails = function (fromUserEmail, toUserEmail, cb) {
    db.User.find({
        where: {
            email: fromUserEmail
        }
    }).then(function (fromUser) {
        db.User.find({
            where: {
                email: toUserEmail
            }
        }).then(function (toUser) {
            getInviteByUsers(fromUser, toUser, cb);
        }, cb);
    }, cb);
};
var getInviteByUsers = function (fromUser, toUser, cb) {
    db.Invite.find({
        where: {
            sentUserId: fromUser.id,
            receivedUserId: toUser.id
        }
    }).then(function (invite) {
        cb(null, invite);
    }, function (error) {
        cb(error);
    });
};


var codeGenerator = new Hashids("this is my salt");


var create = function (fromUserEmail, toUserEmail, toUserDefaults, cb) {
    if (!cb) {
        cb = toUserDefaults;
        toUserDefaults = {};
    }

    db.User.findOrCreate({
        where: {
            email: fromUserEmail
        }
    })
    .spread(function (fromUser, created) {
        if (!fromUser) {
            cb(new Error("No user for email " + fromUserEmail));
            return;
        }
        winston.info("invition.create", "fromUser found", "created", created);

        db.User.findOrCreate({
            where: {
                email: toUserEmail
            },
            defaults: toUserDefaults
        })
        .spread(function (toUser, created) {
            if (!toUser) {
                cb(new Error("No user for email " + toUserEmail));
                return;
            }

            getInviteByUsers(fromUser, toUser, function (error, invite) {
                if (error) {
                    return cb(error);
                }
                if (invite) {
                    winston.info("Invite already exists from " + fromUserEmail + " to " + toUserEmail);
                    return cb(null, invite);
                }
            
                winston.info("invition.create", "toUser found", "created", created);

                var now = (new Date).getTime();
                var code = codeGenerator.encode(fromUser.id, toUser.id, now);

                winston.info("invition.create", "code", code, 
                    "fromUserId", fromUser.id, "toUserId", toUser.id);


                db.Invite.create({
                    code: code
                })
                .then(function (invite) {
                    fromUser.addSentInvites(invite)
                    .then(function () {
                        toUser.addReceivedInvites(invite)
                        .then(function () {
                            cb(null, invite);
                        }, cb);
                    }, cb);
                }, cb);
            });
        }, cb);
    }, cb);
};

var getSentInvites = function (user, cb) {
    user.getSentInvites({
        include: [{
            model: db.User,
            as: 'SentUser'
        }, {
            model: db.User,
            as: 'ReceivedUser'
        }]
    })
    .then(function (invites) {
        cb(null, invites);
    }, function (error) {
        cb(error);
    });
};

module.exports = {
    create: create,
    codeGenerator: codeGenerator,
    getByCode: getInviteByCode,
    getByUsers: getInviteByUsers,
    getByEmails: getInviteByEmails,
    getSentInvites: getSentInvites
};
