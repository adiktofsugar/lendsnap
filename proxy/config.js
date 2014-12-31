require('lendsnap-service-register')
    .etcdHost(process.env.ETCD_HOST)
    .data({
        host: process.env.MACHINE_PRIVATE_IP,
        port: 44
    })
    .broadcast('/services/proxy');

module.exports = {
    serviceRegister: serviceRegister
};
