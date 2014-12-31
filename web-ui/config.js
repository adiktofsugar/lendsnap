var serviceRegister = require('lendsnap-service-register')
    .etcdHost(process.env.ETCD_HOST)
    .data({
        host: process.env.MACHINE_PRIVATE_IP,
        port: 3000
    })
    .broadcast('/services/web-ui');

module.exports = {
    serviceRegister: serviceRegister
};
