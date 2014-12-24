var _ = require('lodash');
var Etcd = require('node-etcd');

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

var broadcastInterval = 10000;
var errorTimeout = 100;
function ServiceRegister(options) {
    var requiredOptions = ["host", "port", "etcdHost"];
    var missingRequiredKeys = requiredOptions.filter(function (requiredOption) {
            return options[requiredOption] === undefined;
        });
    if (missingRequiredKeys.length > 0) {
        throw new Error("ServiceRegister missing required options - " + missingRequiredKeys.join(','));
    }

    this.etcd = new Etcd(options.etcdHost);
    this.broadcastServiceNames = options.broadcastServiceNames || [];
    this.data = _.extend({
        host: options.host,
        port: options.port
    }, options.data || {});
    this.servicesCache = {};
    this.showDebug = options.debug;
}
ServiceRegister.prototype = {
    debug: function () {
        if (this.showDebug) {
            console.debug.apply(console, arguments);
        }
    },
    broadcast: function () {
        var self = this;
        this.broadcastServiceNames.forEach(function (serviceName) {
            self.etcd.set('/services/' + serviceName, JSON.stringify(self.data),
            {ttl: broadcastInterval/1000}, function (error) {
                var timeout = broadcastInterval;
                if (error) {
                    self.debug("Etcd error", error);
                    timeout = errorTimeout;
                }
                setTimeout(self.broadcast.bind(self), timeout);
            });
        });
    },
    listen: function () {
        var self = this;
        function setServicesCache(node) {
            var nodes = getNodesFromNode(node);
            nodes.forEach(function (node) {
                var serviceKey = node.key;
                var serviceKeyParts = serviceKey.replace(new RegExp('^/services/'), '').split('/');

                var serviceValue;
                try {
                    serviceValue = JSON.parse(node.value);
                } catch (e) {
                    console.log('Error parsing json input', node.value);
                }
                var currentServiceObject = self.servicesCache;
                _.each(serviceKeyParts, function (keyPart, index) {
                    var existing = currentServiceObject[keyPart];
                    if (!existing) {
                        existing = currentServiceObject[keyPart] = {};
                    }
                    if (index == serviceKeyParts.length - 1) {
                        existing = currentServiceObject[keyPart] = serviceValue;
                    }
                    currentServiceObject = existing;
                });
            });
            self.debug("services", self.servicesCache);
        }
        function requestServices() {
            self.etcd.get('/services', {recursive: true}, function (error, response) {
                var timeout = broadcastInterval * 1000;
                if (error) {
                    self.debug("error getting services");
                    timeout = errorTimeout;
                }
                if (response && response.node) {
                    setServicesCache(response.node);
                }
                setTimeout(requestServices, timeout);
            });
        }
        requestServices();
    },
    getService: function (serviceName) {
        return this.servicesCache[serviceName];
    }
};

module.exports = {
    ServiceRegister: ServiceRegister
};
