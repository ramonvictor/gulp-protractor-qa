var util = require('util');
var gutil = require('gulp-util');
var cheerio = require('cheerio');
var async = require('async');
var EventEmitter = require('events');

// `GulpProtractorQA` sub-modules dependecies
var storeFileContent = require('./lib/store-file-content');
var findSelectors = require('./lib/find-selectors');
var findViewMatches = require('./lib/find-view-matches');
var consoleOutput = require('./lib/console-output');
var watchFilesChange = require('./lib/watch-files-change');

// Constant
var PLUGIN_NAME = 'gulp-protractor-qa';

// Define `GulpProtractorQA` class.
// @class
function GulpProtractorQA() {
	this.testFiles = [];
	this.viewFiles = [];
	this.selectors = [];
	this.watchIsRunning = 0;
}

// Inherit EventEmitter.
util.inherits(GulpProtractorQA, EventEmitter);

// Init application.
//
// @param {Object} options
// @param {string} options.testSrc - Glob pattern string point to test files
// @param {string} options.testSrc - Glob pattern string point to view files
// @param {boolean} options.runOnce - Flag to decide whether it should watch files changes or not
GulpProtractorQA.prototype.init = function(options) {
	this.options = options || {};

	if (!this.options.testSrc) {
		throw new gutil.PluginError(PLUGIN_NAME, '`testSrc` required');
	}
	if (!this.options.viewSrc) {
		throw new gutil.PluginError(PLUGIN_NAME, '`viewSrc` required!');
	}

	readFiles.call(this);
}


// Read `testSrc` and `viewSrc` files content.
function readFiles() {
	var self = this;

	async.waterfall([
		function(callback) {
			storeFileContent.init(self.options.testSrc, callback);
		},
		function(data, callback) {
			self.testFiles = data;
			storeFileContent.init(self.options.viewSrc, callback);
		},
		function(data, callback) {
			self.viewFiles = data;
			callback(null, 'success');
		}
	], function(err, data) {
		findElementSelectors.call(self);
	});
}


// Loop through test files and find protractor
// selectors (e.g.: by.css('[href="/"]')).
function findElementSelectors() {
	var self = this;
	// reset selectors
	this.selectors = [];

	this.testFiles.forEach(function(item) {
		self.selectors = self.selectors.concat(findSelectors.init(item));
	});

	checkSelectorViewMatches.call(this);
}

function checkSelectorViewMatches() {
	var self = this;

	this.viewFiles.forEach(function(item) {
		findViewMatches.init(self.selectors, item.content);
	});

	outputResult.call(this);
}

function outputResult() {
	var notFoundItems = this.selectors.filter(function(item) {
	    return !item.found;
	});

	consoleOutput.printFoundItems(notFoundItems);

	if (!this.options.runOnce && !this.watchIsRunning) {
		startWatchingFiles.call(this);
	}
}

function startWatchingFiles() {
	var self = this;
	this.watchIsRunning = 1;

	// Init gaze
	watchFilesChange.call(this);

	// Listen to change event
	this.on('change', function(data) {
		// TODO: avoid looping through all files
		findElementSelectors.call(self);
	});
}

// Exporting the plugin main function
module.exports = new GulpProtractorQA();