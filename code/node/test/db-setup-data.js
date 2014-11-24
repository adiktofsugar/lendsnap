var db = require('../db');
var md5 = require("MD5");

module.exports = function (callback) {
    db.User.bulkCreate([
        {
            id: 1,
            firstName: "Sean",
            email: "sean@test-lendsnap.com",
            password: md5("a")
        },
        {
            id: 2,
            firstName: "Bob",
            email: "bob@test-lendsnap.com",
            password: md5("a")
        }
    ]).then(function () {
        db.User.find(1).then(function (user) {
            callback(null, user)
        }, callback);
    }, callback);
};
