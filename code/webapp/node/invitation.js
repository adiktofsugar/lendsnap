var db = require('./models');

var getInvite = function (code, cb) {
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

module.exports = {
    get: getInvite
};
