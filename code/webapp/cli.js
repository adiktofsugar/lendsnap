#!/usr/bin/env node
var nomnom = require('nomnom');
var path = require("path");
var cwd = __dirname;
var spawn = require("child_process").spawn;

// in the order that they would need to start...
var IMAGES = [
    {
        name: "database",
        ports: ["3606"]
    },
    {
        name: "node",
        ports: ["2080:80"],
        links: ["database"]
    },
    {
        name: "nginx",
        ports: ["2080:80"],
        links: ["node"]
    }
];

var IMAGE_NAMES = [];
var IMAGE_NAME_TO_PORTS = {};
var IMAGE_NAME_TO_LINKS = {};
IMAGES.forEach(function (image) {
    IMAGE_NAMES.push(image.name);
    IMAGE_NAME_TO_LINKS[image.name] = image.links;
    IMAGE_NAME_TO_PORTS[image.name] = image.ports;
});


var withSpace = function (optionString) {
    if (optionString) {
        return " " + optionString;
    }
    return "";
};
var getOptionString = function (optionName, optionValues) {
    return optionValues.map(function (value) {
        return optionName + " " + value;
    }).join(" ");
};
var getVolumes = function (isDev) {
    var volumes = [];
    if (isDev) {
        volumes.push(cwd + ":/var/lendsnap");
    } else {
        volumes.push("/var/lendsnap");
    }
    return volumes;
};
var getCommands = {
    "run": function (options) {
        var volumes = getVolumes(options.env == "dev");
        var imageNames = options.image ? [options.image] : IMAGE_NAMES;
        
        return imageNames.map(function (imageName) {
            var ports = IMAGE_NAME_TO_PORTS[imageName];
            var links = IMAGE_NAME_TO_LINKS[imageName];
            
            return "docker run --rm " + 
                "--name=" + imageName +
                withSpace(getOptionString("-v", volumes)) +
                withSpace(getOptionString("-p", ports)) +
                withSpace(getOptionString("-l", links)) +
                " -d " + imageName;
        });
    },
    "build": function (options) {
        return IMAGE_NAMES.map(function (imageName) {
            return "docker build -t " + imageName + " " + cwd + "/" + imageName;
        });
    },
    "console": function (options) {
        var volumes = getVolumes(options.env == "dev");
        var imageName = options.image;
        var links = IMAGE_NAME_TO_LINKS[imageName];
        return [
            "docker run -ti --rm" +
            withSpace(getOptionString('-v', volumes)) +
            withSpace(getOptionString('-l', links)) +
            " " + imageName + " /bin/bash"
        ];
    }
};

var runCommandFunction = function (commandName) {
    var getCommandFunction = getCommands[commandName];

    return function (options) {
        var commands = getCommandFunction(options);
        commands.reverse();

        var runCommand = function () {
            var command = commands.pop();
            if (!command) {
                return;
            }
            if (typeof command == "string") {
                command = {
                    command: command
                };
            }
            var commandString = command.command;
            console.log("Command: " + commandString);
            
            var completed = false;
            var complete = function () {
                if (completed) return;
                completed = true;
                runCommand();
            };

            var commandArgs = commandString.split(" ");
            spawn(commandArgs[0], commandArgs.slice(1), {
                stdio: 'inherit'
            })
            .on("error", function (error) {
                if (!command.ignoreError) {
                    throw error;
                }
            })
            .on("close", function () {
                complete();
            });
        };
        runCommand();
    };
};

nomnom.option('env', {
    abbr: 'e',
    default: "dev"
});


nomnom.command("build")
    .help("Build the docker images")
    .callback(runCommandFunction("build"));
nomnom.command("run")
    .options({
        'image': {
            abbr: 'i',
            help: "Image to run - " + IMAGE_NAMES.join("|") + " (leave blank for all)",
            choices: IMAGE_NAMES
        }
    })
    .help("Run a command")
    .callback(runCommandFunction("run"));
nomnom.command("console")
    .options({
        'image': {
            position: 1,
            required: true,
            help: "Image to console into - " + IMAGE_NAMES.join("|")
        }
    })
    .help("Open bash docker style (dev mode assumed)")
    .callback(runCommandFunction("console"));

nomnom.parse();
