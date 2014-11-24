var vows = require('vows');
var assert = require('assert');
var chalk = require("chalk");

var config = require('../config');
config.setEnvironment("test");

vows.describe('invite')
.addBatch({
    'create': {
        topic: function () {
            var callback = this.callback;
            
            var invitation = require('../invitation');
            var db = require('../db');

            db.User.find({
                where: {
                    email: "sean@test-lendsnap.com"
                }
            })
            .then(function (sendingUser) {
                invitation.create(sendingUser.email, "b@w.com",
                    function (error, firstInvite) {
                    if (error) {
                        return callback(error);
                    }
                    
                    invitation.create(sendingUser.email, "b@w.com",
                    function (error, secondInvite) {
                        if (error) {
                            return callback(error);
                        }

                        db.User.find({
                            where: {
                                email: "b@w.com"
                            }
                        }).then(function (receivingUser) {

                            callback(null, {
                                sendingUser: sendingUser,
                                receivingUser: receivingUser,
                                firstInvite: firstInvite,
                                secondInvite: secondInvite
                            });
                        }, callback);
                    });
                });
            }, callback);
        },
        'doens\'t make a new invite': function (topic) {
            assert.equal(topic.firstInvite.id, topic.secondInvite.id);
        }
    }
})
.export(module);
