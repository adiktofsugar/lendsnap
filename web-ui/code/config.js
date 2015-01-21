var Etcd = require('node-etcd');

var serviceRegistration = require('./service-registration');

var port = 3000;
var etcdHost = process.env.ETCD_HOST;
if (!etcdHost) {
    throw new Error("etcdHost is not defined.");
}
var etcd = new Etcd(etcdHost);
function broadcast () {
    serviceRegistration.broadcastJson(etcd, '/services/web-ui', {
        host: process.env.MACHINE_PRIVATE_IP,
        port: port
    });
    serviceRegistration.cacheJson(etcd);
}

module.exports = {
    port: port,
    etcd: etcd,
    broadcast: broadcast,
    getJson: function () {
        return serviceRegistration.getJson.apply(serviceRegistration, arguments);
    }
};
