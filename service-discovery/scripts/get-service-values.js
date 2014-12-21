function getServiceValues(etcd, serviceKeys, callback) {
    var keyValues = {};
    serviceKeys.forEach(function (key) {
        keyValues[key] = {
            finished: false
        };
        etcd.get(key, function (error, response) {
            keyValues[key].finished = true;
            console.log("Completed request", key, "error", error, "response", response);
            var value = response.node ? response.node.value : "null";
            console.log("value", value);
            try {
                value = JSON.parse(value);
            } catch (e) {
                console.log("Couldn't parse value", value);
            }
            keyValues[key].value = value;
            done();
        });
    });

    function done() {
        var ready = true;
        Object.keys(keyValues).forEach(function (key) {
            if (!keyValues[key].finished) {
                ready = false;
            }
        });
        if (!ready) {
            console.log("Not ready", keyValues);
            return;
        }
        var environmentVariables = {};
        Object.keys(keyValues).forEach(function (key) {
            var value = keyValues[key].value;
            if (value) {
                Object.keys(value).forEach(function (valueKey) {
                    var environmentVariableKey = key.slice(1).replace(new RegExp("/", "g"), "_").toUpperCase() +
                        "_" + valueKey.toUpperCase();
                    var environmentVariableValue = value[valueKey];
                    environmentVariables[environmentVariableKey] = environmentVariableValue;
                });
            }
        });
        callback(null, environmentVariables);
    }
}
module.exports = getServiceValues;
