var through = require('through2');
var gutil = require('gulp-util');

const PLUGIN_NAME = 'gulp-protractor-qa';


function gulpProtractorAdvisor() {

  // Creating a stream through which each file will pass
  var stream = through.obj(function(file, enc, cb) {
		
		if (file.isNull()) {
			this.push(file);
			return cb();
		}

		if (file.isStream()) {
			this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
			return cb();
		}

		var str = file.contents.toString('utf8');

		// regex
		var re = /by\.model\('(.*?)'\)/gi;
		var results;
		while ((results = re.exec(str)) !== null)
		{
		  console.log(results[1]);
		}

		cb();
  });

  // returning the file stream
  return stream;
};

// Exporting the plugin main function
module.exports = gulpProtractorAdvisor;