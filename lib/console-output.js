var gutil = require('gulp-util');
var chalk = require('chalk');
var PLUGIN_NAME = 'gulp-protractor-qa';

function ConsoleOutput(notFound) {
	if (notFound.length > 0) {
		notFound.forEach(function(item) {
			gutil.log([
				'[', chalk.cyan(PLUGIN_NAME), '] ',
				chalk.red('\u2718 by.' + item.type + ': '),
				chalk.red(item.value),
				' at ', chalk.bold(item.path),
				' not found within view files!'
			].join(''));
		});
	} else {
		gutil.log([
			'[', chalk.cyan(PLUGIN_NAME), '] ',
			chalk.green('\u2714 all test elements were successfully found!')
		].join(''));
	}
}

module.exports = ConsoleOutput;