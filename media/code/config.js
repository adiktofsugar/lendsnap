var Etcd = require('node-etcd');
var serviceRegistration = require('./service-registration');

var port = 3001;
var etcdHost = process.env.ETCD_HOST;
if (!etcdHost) {
    throw new Error("etcdHost is not defined.");
}

var etcd = new Etcd(etcdHost);
function broadcast () {
    serviceRegistration.broadcastJson(etcd, '/services/media', {
        host: process.env.MACHINE_PRIVATE_IP,
        port: port
    });
}

module.exports = {
    port: port,
    etcd: etcd,
    broadcast: broadcast,
    getJson: function () {
        var args = Array.prototype.slice.call(arguments);
        serviceRegistration.getJson.apply(serviceRegistration, [etcd].concat(args));
    }
};
