#!/usr/bin/env node
var test = require('lendsnap-tests');
var serviceRegister = require('./index');
var assert = require('assert');

var TestServiceRegister = function () {
    this.properties = {};
};
TestServiceRegister.prototype = serviceRegister;

var tests = {};
tests.broadcastCallsEtcd = function (done) {
    var testServiceRegister = new TestServiceRegister()
        .etcdHost('123.321')
        .data({host: '1.1.1.1'})
        .broadcast('/services/test');
    
    var etcd = testServiceRegister.etcd;
    etcd.get = function () {
    };
    etcd.set = function (key, value) {
        var error = assert.async.equal(key, '/services/test');
        if (error) {
            return done(error);
        }
        try {
            value = JSON.parse(value);
            assert.equal(value.host, '1.1.1.1');
        } catch (e) {
            return done(e);
        }
        done();
    };
};
tests.listenInterpretsServices = function (done) {
    var testServiceRegister = new TestServiceRegister()
        .etcdHost('123.321')
        .data({host: '1.1.1.1'})
        .broadcast('/services/test');
    
    var etcd = testServiceRegister.etcd;
    etcd.get = function (key, options, callback) {
        if (!callback) {
            callback = options;
            options = {};
        }
        callback(null, {
          "action": "get",
          "node": {
            "key": "/services",
            "dir": true,
            "nodes": [
              {
                "key": "/services/test",
                "value": "{\"my\":\"thing\"}",
                "modifiedIndex": 15127,
                "createdIndex": 15127
              },
              {
                "key": "/services/db",
                "value": "{\"host\": \"172.17.8.102\", \"port\": \"3306\",    \"root_password\": \"a\", \"password\": \"a\",     \"name\": \"lendsnap\", \"user\": \"lendsnap\"}",
                "expiration": "2014-12-22T20:03:03.193048715Z",
                "ttl": 98668,
                "modifiedIndex": 94942,
                "createdIndex": 94942
              },
              {
                "key": "/services/web-ui",
                "value": "{\"host\":\"172.17.8.101\",\"port\":3000}",
                "expiration": "2014-12-22T20:03:06.179989349Z",
                "ttl": 98671,
                "modifiedIndex": 94925,
                "createdIndex": 94925
              },
              {
                "key": "/services/proxy",
                "value": "{\"host\":\"172.17.8.101\"}",
                "expiration": "2014-12-22T20:03:00.31643453Z",
                "ttl": 98665,
                "modifiedIndex": 94940,
                "createdIndex": 94940
              }
            ],
            "modifiedIndex": 6508,
            "createdIndex": 6508
          }
        });
    };
    setTimeout(function () {
        var dbService = testServiceRegister.getService('db');
        var error = assert.async.equal(dbService.host, '172.17.8.102');
        done(error);
    }, 5);
};
tests.listenInterpretsServicesWithBadNodeValue = function (done) {
    var testServiceRegister = new TestServiceRegister()
        .etcdHost('123.321')
        .data({host: '1.1.1.1'})
        .broadcast('/services/test');

    var etcd = testServiceRegister.etcd;
    etcd.get = function (key, options, callback) {
        if (!callback) {
            callback = options;
            options = {};
        }
        callback(null, {
          "action": "get",
          "node": {
            "key": "/services",
            "dir": true,
            "nodes": [
              {
                "key": "/services/test",
                "value": "",
                "modifiedIndex": 15127,
                "createdIndex": 15127
              },
              {
                "key": "/services/db",
                "value": "{\"host\": \"172.17.8.102\", \"port\": \"3306\",    \"root_password\": \"a\", \"password\": \"a\",     \"name\": \"lendsnap\", \"user\": \"lendsnap\"}",
                "expiration": "2014-12-22T22:20:04.085235491Z",
                "ttl": 98521,
                "modifiedIndex": 103282,
                "createdIndex": 103282
              }
            ],
            "modifiedIndex": 6508,
            "createdIndex": 6508
          }
        });
    };
    setTimeout(function () {
        var dbService = testServiceRegister.getService('db');
        var error = assert.async.equal(dbService.host, '172.17.8.102');
        done(error);
    }, 5);
};

test.run(tests);
