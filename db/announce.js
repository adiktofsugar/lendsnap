var Etcd = require('node-etcd');
var credentials = require('./credentials');

var etcdHost = process.env.ETCD_HOST;
if (!etcdHost) {
    throw new Error("etcdHost is not defined.");
}
var etcd = new Etcd(etcdHost);
var serviceRegistration = require('./service-registration');
serviceRegistration.broadcastJson(etcd, '/services/db', {
        host: process.env.MACHINE_PRIVATE_IP,
        port: 3306,
        password: credentials.password,
        user: credentials.user
    });
function keepalive() {
    setTimeout(keepalive, 10000);
}
keepalive();
