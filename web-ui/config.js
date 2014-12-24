var ServiceRegister = require('lendsnap-service-register').ServiceRegister;
var serviceRegister = new ServiceRegister({
    host: process.env.MACHINE_PRIVATE_IP,
    port: 3000,
    etcdHost: process.env.ETCD_HOST,
    broadcastServiceNames: ['web-ui']
});
serviceRegister.listen();

var config = {
    serviceRegister: serviceRegister
};

module.exports = {
    serviceRegister: serviceRegister
};
