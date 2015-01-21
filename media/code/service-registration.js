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

function getJson (etcd, key, callback) {
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
    getJson: getJson
};
