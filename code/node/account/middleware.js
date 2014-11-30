var winston = require("winston");
var accountService = require('./service');

function addUser(req, res, next) {
    if (req.session.userId) {
        accountService.getUserById(req.session.userId, function (error, user) {
            if (error) {
                winston.error("Error getting user", error);
            } else {
                req.user = user;
            }
            next();
        });
    } else {
        next();
    }
}

module.exports = {
    addUser: addUser
};
