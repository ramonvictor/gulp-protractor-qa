var Gaze = require('gaze').Gaze;
var fs = require('fs');
var gutil = require('gulp-util');
var chalk = require('chalk');
var _ = require('underscore');

var PLUGIN_NAME = 'gulp-protractor-qa';

function WatchFilesChange() {
	var self = this;
	var appRoot = process.cwd() + '/';

	// watch test files changes
	var gazeTest = new Gaze(this.options.testSrc);
	var gazeView = new Gaze(this.options.viewSrc);

	gazeTest.on('all', function(event, filepath) {
		fs.readFile(filepath, 'utf8', function(err, data){
			if (err) { throw err; }

			var updated = _.findWhere(self.testFiles, {
				path: filepath.replace(appRoot, '')
			});
			var index = self.testFiles.indexOf(updated);

			// Update content
			if (index >= 0) {
				self.testFiles[index].content = data;
				// Output update message
				outputUpdateMessage();
				// Emit event
				self.emit('change', {
					fileType: 'test',
					index: index
				});
			}
		});
	});

	gazeView.on('all', function(event, filepath) {
		fs.readFile(filepath, 'utf8', function(err, data){
			if (err) { throw err; }

			var updated = _.findWhere(self.viewFiles, {
				path: filepath.replace(appRoot, '')
			});
			var index = self.viewFiles.indexOf(updated);

			// Update content
			if (index >= 0) {
				self.viewFiles[index].content = data;
				// Output update message
				outputUpdateMessage();
				// Emit event
				self.emit('change', {
					fileType: 'view',
					index: index
				});
			}
		});
	});

	gutil.log([
		'[', chalk.cyan(PLUGIN_NAME), '] ',
		chalk.blue('files watch is on!')
	].join(''));
}

function outputUpdateMessage() {
	gutil.log([
		'[', chalk.cyan(PLUGIN_NAME), '] ',
		chalk.blue('\u27F3 file updated!')
	].join(''));
}

module.exports = WatchFilesChange;