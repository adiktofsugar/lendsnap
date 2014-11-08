var fs = require('fs');
var path = require('path');

var excludedFolders = ["node_modules", "templates", "test", "scripts"];

var getModules = function () {
    return fs.readdirSync(__dirname).filter(function (filepath) {
            var stats = fs.statSync(filepath);
            return stats.isDirectory();
        }).map(function (filepath) {
            return path.basename(filepath);
        }).filter(function (dirname) {
            return excludedFolders.indexOf(dirname) <= -1;
        });
};

module.exports = {
    getModules: getModules
};
