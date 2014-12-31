var Etcd = require('node-etcd');

var serviceRegistration = require('./service-registration');
var secret = require("crypto")
    .createHash("sha512")
    .update("lendsnapforthewin")
    .digest("hex");

var etcdHost = process.env.ETCD_HOST;
if (!etcdHost) {
    throw new Error("etcdHost is not defined.");
}
var etcd = new Etcd(etcdHost);
function broadcast () {
    serviceRegistration.broadcastJson(etcd, '/services/account', {
        host: process.env.MACHINE_PRIVATE_IP,
        port: 8080,
        secret: secret
    });
}

module.exports = {
    secret: secret,
    etcd: etcd,
    broadcast: broadcast,
    getJson: function () {
        var args = Array.prototype.slice.call(arguments);
        serviceRegistration.getJson.apply(serviceRegistration, [etcd].concat(args));
    }
};
