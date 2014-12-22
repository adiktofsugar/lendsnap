var _ = require('lodash');
var Etcd = require('node-etcd');
var etcd = new Etcd(process.env.ETCD_HOST);

var broadcastInterval = 10;
function broadcast() {
    etcd.set('/services/proxy', JSON.stringify({
        host: process.env.MACHINE_PRIVATE_IP
    }), {ttl: broadcastInterval}, function (error) {
        var timeout = broadcastInterval * 1000;
        if (error) {
            console.error("Etcd error", error);
            timeout = 100;
        }
        setTimeout(broadcast, timeout);
    });
}

function getNodesFromNode (node) {
    var nodes;
    if (node.nodes) {
        nodes = [];
        _.each(node.nodes, function (node) {
            nodes = nodes.concat(getNodesFromNode(node));
        });
    } else {
        nodes = [node];
    }
    return nodes;
}

var servicesCache;
function updateServices() {
    etcd.get('/services', {recursive: true}, function (error, response) {
        var timeout = broadcastInterval * 1000;
        if (error) {
            console.log("error getting services");
            timeout = 100;
        }
        if (response && response.node) {
            if (!servicesCache) {
                servicesCache = {};
            }
            var nodes = getNodesFromNode(response.node);
            nodes.forEach(function (node) {
                var serviceKey = node.key;
                var serviceKeyParts = serviceKey.replace(new RegExp('^/services/'), '').split('/');

                var serviceValue = JSON.parse(node.value);
                var currentServiceObject = servicesCache;
                _.each(serviceKeyParts, function (keyPart) {
                    var existing = currentServiceObject[keyPart];
                    if (!existing) {
                        existing = currentServiceObject[keyPart] = {};
                    }
                    currentServiceObject = existing;
                });
                _.each(serviceValue, function (value, key) {
                    currentServiceObject[key] = value;
                });
            });
        }
        console.log("services", servicesCache);
        setTimeout(updateServices, timeout);
    });
}
updateServices();

var config = {
    broadcast: broadcast
};
Object.defineProperty(config, 'services', {
    get: function () {
        return servicesCache;
    }
});
module.exports = config;
