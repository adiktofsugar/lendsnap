var _ = require('lodash');
var ServiceRegister = require('lendsnap-service-register').ServiceRegister;
var serviceRegister = new ServiceRegister({
    host: process.env.MACHINE_PRIVATE_IP,
    port: 443,
    etcdHost: process.env.ETCD_HOST,
    broadcastServiceNames: ['proxy']
});
serviceRegister.listen();

module.exports = {
    serviceRegister: serviceRegister
};
