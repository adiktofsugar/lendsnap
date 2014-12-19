var Etcd = require('node-etcd');
var etcd = new Etcd(process.env.ETCD_HOST);

var port = 3000;

function broadcast() {
    var setInfo = function () {
        etcd.set("/services/web-ui", JSON.stringify({
            host: process.env.MACHINE_PRIVATE_IP,
            port: port
        }), { ttl: 30 });
    };
    setInterval(setInfo, 20000);
    setInfo();
}

var cachedDbInfo;
function fetchAndUpdateCachedDbInfo() {
    var dbKey = "/services/db-A/db.service";
    etcd.get(dbKey, function (error, rawDbConfig) {
        if (error) {
            console.error("Error getting db config - " + error.message);
        } else {
            cachedDbInfo = JSON.parse(rawDbConfig.node.value);
        }
        var timeout = 10000;
        if (!cachedDbInfo) {
            timeout = 1000;
        }
        setTimeout(fetchAndUpdateCachedDbInfo, timeout);
    });
}
fetchAndUpdateCachedDbInfo();

function capitalize(string) {
    return string.slice(0).toUpperCase() + string.slice(1);
}

var config = {
    broadcast: broadcast,
    port: port
};

['host', 'name', 'user', 'password', 'rootPassword'].forEach(function (dbPropertyName) {
    Object.defineProperty(config, 'db' + capitalize(dbPropertyName), {
        get: function () {
            return (cachedDbInfo || {})[dbPropertyName];
        }
    });
});

module.exports = config;
