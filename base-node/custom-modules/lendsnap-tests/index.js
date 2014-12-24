#!/usr/bin/env node
var chalk = require('chalk');
var async = require('async');
var assert = require('assert');

assert.async = {};
['fail', 'ok', 'equal', 'notEqual', 'deepEqual', 'notDeepEqual', 'strictEqual',
'notStrictEqual', 'throws', 'doesNotThrow', 'ifError'].forEach(function (assertFunctionName) {
    var original = assert[assertFunctionName];
    assert.async[assertFunctionName] = function () {
        try {
            assert[assertFunctionName].apply(assert, arguments);
        } catch (error) {
            return error;
        }
        return null;
    };
});

function TestRunner(tests, options) {
    options = options || {};
    this.tests = tests;
    this.testNames = Object.keys(tests);
    this.testedNames = [];
    this.testResults = {};

    this.showDebug = options.debug;
}
TestRunner.prototype = {
    debug: function () {
        if (this.showDebug) {
            console.log.apply(console, arguments);
        }
    },
    run: function run () {
        var self = this;
        this.testNames.forEach(function (testName) {
            self.runTest(testName);
        });
        this.done();
    },
    runTest: function runTest(testName) {
        var test = this.tests[testName];
        var self = this;
        console.log("Testing " + testName);
        if (test.length == 1) {
            test(function (error) {
                self.ranTest(testName, error);
            });
        } else {
            var error;
            try {
                test();
            } catch (caughtError) {
                error = caughtError;
            }
            self.ranTest(testName, error);
        }
    },
    ranTest: function ranTest(testName, error) {
        if (this.testResults[testName]) {
            return;
        }
        this.debug("ranTest", testName);
        this.testResults[testName] = error ? chalk.red("failed\n" + error.stack) : chalk.green("success");
        this.testedNames.push(testName);
    },
    done: function done() {
        if (this.testedNames.length !== this.testNames.length) {
            this.debug("testedNames length", this.testedNames.length, "testNames length", this.testNames.length);
            return setTimeout(this.done.bind(this), 100);
        }
        var self = this;
        console.log("");
        console.log(chalk.blue("Test results"));
        Object.keys(this.testResults).forEach(function (testName) {
            console.log("Test: " + testName);
            console.log(self.testResults[testName]);
        });
        process.exit();
    }
};

function run(tests, options) {
    var runner = new TestRunner(tests, options);
    runner.run();
}

module.exports = {
    run: run
};
