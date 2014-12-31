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
function ServiceRegister() {
    this.properties = {};
}
ServiceRegister.prototype = {
    data: function (data) {
        this.properties.data = data;
        this.start();
        return this;
    },
    etcdHost: function (etcdHost) {
        this.properties.etcdHost = etcdHost;
        this.etcd = new Etcd(etcdHost);
        this.start();
        return this;
    },
    broadcast: function () {
        this.properties.broadcastKeys = Array.prototype.slice.apply(arguments);
        this.start();
        return this;
    },
    getService: function (servicesKey) {
        return this.servicesCache[servicesKey];
    },
    start: function (force) {
        var self = this;
        if (!force) {
            clearTimeout(this._startTimeout);
            this._startTimeout = setTimeout(this.start.bind(this, true), 1);
            return;
        }
        if (!this.etcd) {
            throw new Error('No etcd exists');
        }
        if (!this.properties.broadcastKeys) {
            this.debug("No broadcastKeys set");
        } else {
            this.startBroadcast();
        }
        this.startListening();
    },
    debug: function () {
        if (this.showDebug) {
            console.debug.apply(console, arguments);
        }
    },
    startBroadcast: function () {
        var self = this;
        function broadcast() {
            self.properties.broadcastKeys.forEach(function (etcdKey) {
                self.etcd.set(etcdKey, JSON.stringify(self.properties.data),
                {ttl: broadcastInterval/1000}, function (error) {
                    var timeout = broadcastInterval;
                    if (error) {
                        self.debug("Etcd error", error);
                        timeout = errorTimeout;
                    }
                    setTimeout(broadcast, timeout);
                });
            });
        }
        broadcast();
    },
    startListening: function () {
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
                if (!self.servicesCache) {
                    self.servicesCache = {};
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
    }
};

var globalServiceRegister = new ServiceRegister();
module.exports = globalServiceRegister;
