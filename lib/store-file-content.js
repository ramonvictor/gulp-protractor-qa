var glob = require('buster-glob');
var async = require('async');
var fs = require('fs');

function StoreFileContent() {
}

StoreFileContent.prototype.init = function(src, callback) {
	async.waterfall([
		function(_callback) {
			getFilesArray(src, _callback);
		},
		function(data, _callback) {
			loopThroughFiles(data, _callback);
		}
	], function(err, data) {
		callback(null, data);
	});
}

function getFilesArray(src, callback) {
	glob.glob(src, function(error, files) {
		if (error) {
			console.log(':: error trying to load files');
		}
		callback(null, files);
	});
}

function loopThroughFiles(list, callback) {
	var collection = [];

	list.forEach(function(item) {
		fs.readFile(item, 'utf8', function (err, data) {
			if (err) { throw err; }

			collection.push({
				path: item,
				content: data
			});

			if (collection.length === list.length) {
				callback(null, collection);
			}
		});
	});
}

module.exports = new StoreFileContent();