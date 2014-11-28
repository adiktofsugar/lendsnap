var vows = require('vows');
var assert = require('assert');
var config = require('../config');

var accountService = require('../account/service');

vows.describe('account')
.addBatch({
    'getUserById': {
        topic: function () {
            var callback = this.callback;
            accountServices.getUserById(1, callback);
        },
        "get the user": function (err, user) {
            assert.isNull(err);
            assert.equal(user.email, "sean@test-lendsnap.com");
        }
    },
    'getUserByEmail': {
        topic: function () {
            var callback = this.callback;
            accountServices.getUserByEmail("sean@test-lendsnap.com", callback);
        },
        "get the user": function (err, user) {
            assert.isNull(err);
            assert.equal(user.id, 1);
        }
    },
    'login with user': {
        topic: function () {
            var callback = this.callback;
            var req = {
                session: {}
            };

            accountServices.getUserById(1, function (error, user) {
                if (error) return callback(error);
                accountServices.login(req, user, function (error) {
                    callback(error, req);
                });
            });
        },
        'req.session.userId should be 1': function (req) {
            assert.equal(req.session.userId, 1);
        }
    },
    'login with email and password': {
        topic: function () {
            var callback = this.callback;
            var req = {
                session: {}
            };

            accountServices.login(req, "sean@test-lendsnap.com", "a", function (error, user) {
                callback(error, req);
            });
        },
        'req.session.userId should be 1': function (req) {
            assert.equal(req.session.userId, 1);
        }
    }
})
.export(module);
