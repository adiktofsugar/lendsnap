#!/usr/bin/node
var Etcd = require('node-etcd');
var getServiceValues = require('./get-service-values');
var options = require('nomnom')
    .option('listen-keys', {
        list: true,
        help: 'A key to kill service on change. Ex: /services/db /services/media'
    })
    .option('announce-key', {
        required: true,
        help: 'The key to set in etcd. Ex: /services/awesome'
    })
    .option('announce-values', {
        required: true,
        list: true,
        help: 'A value to set in etcd. Ex: host=123 port=123',
    })
    .option('etcd-host', {
        default: process.env.ETCD_HOST || '127.0.0.1'
    })
    .nom();

var announceKey = options['announce-key'];
var announceValues = options['announce-values'];
var listenKeys = options['listen-keys'] || [];

var announceValue = {};
announceValues.forEach(function (keyValuePair) {
    var split = keyValuePair.split("=");
    announceValue[split[0]] = split[1];
});
announceValue = JSON.stringify(announceValue);

console.log("announce key: ", announceKey);
console.log("announce value: ", announceValue);
console.log("listen keys: ", listenKeys.join(", "));


var etcd = new Etcd(options['etcd-host']);
function errorHandler(error) {
    if (error) {
        console.log("Error announcing at " + announceKey);
        console.log(error);
        process.exit(1);
    }
}

var INTERVAL = 10;

function announce() {
    console.log("announcing", announceKey, announceValue);
    etcd.set(announceKey, announceValue, {ttl: INTERVAL + 1}, errorHandler);
    setTimeout(announce, (INTERVAL * 1000));
}

function exitGenerator(key) {
    return function () {
        console.log("Key changed: " + key, arguments);
        process.exit(100);
    };
}

var requests = [];
function listen() {
    requests.forEach(function (request) {
        request.abort();
    });
    requests = [];
    listenKeys.forEach(function (key) {
        console.log("watching", key);
        var exit = exitGenerator(key);
        requests.push(etcd.get(key, {wait:true}, exit));
    });
    setTimeout(listen, INTERVAL * 1000);
}

announce();
listen();

getServiceValues(etcd, listenKeys, function (error, keyValues) {
    Object.keys(keyValues).forEach(function (key) {
        process.env[key] = keyValues[key];
    });
});
