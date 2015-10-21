var Gaze = require('gaze').Gaze;
var fs = require('fs');
var _ = require('underscore');

var consoleOutput = require('./console-output');

var PLUGIN_NAME = 'gulp-protractor-qa';
var PLUGIN_ROOT = process.cwd() + '/';

function watchFilesChange() {
	var self = this;

	// watch test files changes
	var gazeTest = new Gaze(this.options.testSrc);
	var gazeView = new Gaze(this.options.viewSrc);

	gazeTest.on('all', gazeTestHandler.bind(this));
	gazeView.on('all', gazeViewHandler.bind(this));

	consoleOutput.printBlue('Files watch is on!');
}

function gazeTestHandler(event, filepath) {
	var self = this;
	fs.readFile(filepath, 'utf8', function(err, data){
		if (err) { throw err; }

		onFileChange.call(self, {
			type: 'test',
			collection: self.testFiles,
			path: filepath.replace(PLUGIN_ROOT, ''),
			content: data
		});
	});
}

function gazeViewHandler(event, filepath) {
	var self = this;
	fs.readFile(filepath, 'utf8', function(err, data){
		if (err) { throw err; }

		onFileChange.call(self, {
			type: 'view',
			collection: self.viewFiles,
			path: filepath.replace(PLUGIN_ROOT, ''),
			content: data
		});
	});
}

function onFileChange(fileChanged) {
	var updated = _.findWhere(fileChanged.collection, {
		path: fileChanged.path
	});
	var index = fileChanged.collection.indexOf(updated);

	// Update content
	if (index >= 0) {
		fileChanged.collection[index].content = fileChanged.content;
		// Output update message
		outputFileUpdatedMessage();
		// Emit event
		this.emit('change', {
			fileType: fileChanged.type,
			index: index,
			path: fileChanged.path
		});
	}
}

function outputFileUpdatedMessage() {
	consoleOutput.printBlue('\u27F3 File updated!');
}

module.exports = watchFilesChange;