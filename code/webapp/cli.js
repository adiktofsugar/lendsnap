#!/usr/bin/env node
var nomnom = require('nomnom');
var path = require("path");
var cwd = __dirname;
var spawn = require("child_process").spawn;

var IMAGE_NAMES = ["nginx", "node", "database"];

var withSpace = function (optionString) {
    if (optionString) {
        return " " + optionString;
    }
    return "";
};
var getOptionString = function (isDev) {
    var volume = isDev ? cwd + ":/var/lendsnap" : "/var/lendsnap";
    return "-v " + volume;
};
var getCommands = {
    "run": function (options) {
        var optionString = getOptionString(options.env == "dev");
        var imageNames = options.image ? [options.image] : IMAGE_NAMES;
        var ports = {
            "nginx": "2080:80",
            "node" :"23000:3000",
            "database": "23600:3606"
        };
        return imageNames.map(function (imageName) {
            var port = ports[imageName];
            var portOptionString = port ? "-p " + port : null;
            return "docker run" + withSpace(optionString) +
                withSpace(portOptionString) + " -d " + imageName;
        });
    },
    "build": function (options) {
        return IMAGE_NAMES.map(function (imageName) {
            return "docker build -t " + imageName + " " + cwd + "/" + imageName;
        });
    },
    "console": function (options) {
        var optionString = getOptionString(options.env == "dev");
        var imageName = options.image;
        return [
            "docker run -ti" + withSpace(optionString) +
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
