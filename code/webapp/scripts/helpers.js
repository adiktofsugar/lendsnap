var fs = require('fs');
var path = require('path');

module.exports = {
    getAppNames: function () {
        var files = fs.walkdirSync(__dirname);
        var directories = files.filter(function (file) {
                var stat = fs.statSync(file);
                return stat.isDirectory();
            });
        var directoryNames = directories.map(function (directory) {
                return path.basename(directory);
            });

        return directoryNames.filter(function (directoryName) {
                return ["node_modules", "bin", "scripts"]
                    .indexOf(directoryName) <= -1;
            });
    }
};
