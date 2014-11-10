#!/usr/bin/env node
var nomnom = require('nomnom');
var path = require("path");
var cwd = __dirname;
var spawn = require("child_process").spawn;

var withSpace = function (optionString) {
    if (optionString) {
        return " " + optionString;
    }
    return "";
};
var getCommand = {
    "start": function (options) {
        var optionString = "";
        var command = "";
        if (options.env == "dev") {
            optionString = "-v " + cwd + ":/var/lendsnap " +
                "-p 8080:80";
        }
        
        return "docker run" + withSpace(optionString) +
            " -d lwa";
    },
    "build": function (options) {
        return "docker build -t lwa " + cwd;
    },
    "console": function (options) {
        var optionString = "-v " + cwd + ":/var/lendsnap " +
                "-p 8080:80";
        return "docker run -ti" + withSpace(optionString) +
            " lwa /bin/bash";
    }
};

var runCommandFunction = function (commandName) {
    var getCommandFunction = getCommand[commandName];

    return function (options) {
        var command = getCommandFunction(options);
        console.log("Command: " + command);
        
        var commandArgs = command.split(" ");
        spawn(commandArgs[0], commandArgs.slice(1), {
            stdio: 'inherit'
        });
    };
};

nomnom.option('env', {
    abbr: 'e',
    default: "dev"
});

nomnom.command("build")
    .help("Build the docker image")
    .callback(runCommandFunction("build"));
nomnom.command("start")
    .help("Start the docker for the webapp")
    .callback(runCommandFunction("start"));
nomnom.command("console")
    .help("Open bash docker style (dev mode assumed)")
    .callback(runCommandFunction("console"));

nomnom.parse();
