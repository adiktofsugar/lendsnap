var Etcd = require('node-etcd');
var etcd = new Etcd(process.env.ETCD_HOST);

function broadcast() {
    var setInfo = function () {
        etcd.set("/services/web-ui", JSON.stringify({
            host: process.env.MACHINE_PRIVATE_IP,
            port: process.env.PORT
        }), { ttl: 30 });
    };
    setInterval(setInfo, 20000);
    setInfo();
}

var dbReadyFlag = false;
var dbReadyCallbacks = [];
function dbReady(callback) {
    if (callback === undefined) {
        dbReadyFlag = true;
    } else {
        dbReadyCallbacks.push(callback);
    }
    if (!dbReadyFlag) {
        return;
    }
    var iterCallback;
    while ((iterCallback = dbReadyCallbacks.shift())) {
        iterCallback();
    }
}

var cachedDbInfo;
function fetchAndUpdateCachedDbInfo() {
    var dbKey = "/services/db";
    etcd.get(dbKey, function (error, rawDbConfig) {
        if (error) {
            console.error("Error getting db config - " + error.message);
        } else {
            cachedDbInfo = JSON.parse(rawDbConfig.node.value);
            dbReady();
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
    return string.slice(0, 1).toUpperCase() + string.slice(1);
}
function pascalCase(string) {
    var words = string.split(/\s|_/g);
    return words.map(function (word) {
            return capitalize(word);
        }).join("");
}

var config = {
    broadcast: broadcast,
    dbReady: dbReady
};

['host', 'name', 'user', 'password', 'root_password'].forEach(function (dbPropertyName) {
    var key = 'db' + pascalCase(dbPropertyName);
    Object.defineProperty(config, key, {
        get: function () {
            return (cachedDbInfo || {})[dbPropertyName];
        }
    });
});

module.exports = config;
