var flattenNodes = function(nodes) {
    var flattenedNodes = [];
    nodes.forEach(function(node) {
        if (node.nodes) {
            flattenedNodes = flattenedNodes.concat(flattenNodes(node.nodes));
        } else {
            flattenedNodes.push(node);
        }
    });
    return flattenedNodes;
}

var BROADCAST_TTL = 30000;

var broadcastTimeout;
function broadcastJson (etcd, key, value){
    if (broadcastTimeout) {
        clearTimeout(broadcastTimeout);
    }
    etcd.set(key, JSON.stringify(value), {ttl: BROADCAST_TTL/1000}, function (error) {
        var timeout = BROADCAST_TTL - 1000;
        if (error) {
            console.error('Error broadcasting ' + key + ' - ' + error);
            timeout = 1000;
        }
        broadcastTimeout = setTimeout(function () {
            broadcastJson(etcd, key, value);
        }, timeout);
    });
}

var cacheJsonTimeout;
var jsonCache = {};
function cacheJson(etcd) {
    clearTimeout(cacheJsonTimeout);
    etcd.get('/services', {recursive:true}, function (error, response) {
        var timeout = 1000;
        if (error) {
            console.error("Error fetching services", error);
            timeout = 100;
        }
        var nodes = flattenNodes(response.node.nodes);
        nodes.forEach(function (node) {
            try {
                jsonCache[node.key] = JSON.parse(node.value);
            } catch (e) {
                console.error("Couldnt set " + node.key +", value was " + node.value);
            }
            var cachedValue = jsonCache[node.key];
            if (cachedValue && cachedValue.host && cachedValue.port) {
                cachedValue.address = cachedValue.host + ':' + cachedValue.port;
            }
        });
        cacheJsonTimeout = setTimeout(function () {
            cacheJson(etcd);
        }, timeout);
    });
}
function getJson (key) {
    return jsonCache[key];
}
function getJsonAsync (etcd, key, callback) {
    callback = callback || function () {};
    etcd.get(key, function (error, response) {
        if (error) {
            return callback(error);
        }
        var value = response.node.value;
        if (!value) {
            value = "null";
        }
        callback(null, JSON.parse(value));
    });
}

module.exports = {
    broadcastJson: broadcastJson,
    cacheJson: cacheJson,
    getJson: getJson,
    getJsonAsync: getJsonAsync
};
