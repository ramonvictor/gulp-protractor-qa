var cheerio = require('cheerio');

function FindViewMatches() {
	this.by = {
		binding : function(value) {
			return attrSelector('bind', value);
		},
		model: function(value) {
			return attrSelector('model', value);
		},
		repeater: function(value) {
			return attrSelector('repeat', value);
		},
		css: function(value) {
			return value;
		},
		id: function(value) {
			return '#' + value;
		}
	};
}

FindViewMatches.prototype.init = function(selectors, content) {
	var self = this;
	var $ = cheerio.load(content);

	selectors.forEach(function(selector) {
		var selectorString = '';
		var value = selector.value;
		var type = selector.type;

		if (!self.by[type]) {
			selector.disabled = 1;
			return;
		} else {
			selectorString = self.by[type](value);
		}

		if ($(selectorString).length) {
			selector.found = 1;
		}

		if (type === 'binding' && !selector.found) {
			selector.found = bindExists(value, content);
		}
	});
}

function attrSelector(attr, value) {
	return [
		'[ng-', attr, '="', value, '"], ',
		'[data-ng-', attr, '="', value, '"]'
	].join('');
}

function bindExists(bind, contents) {
	var results;
	var exists = 0;
	var pattern = /{{(.*?)}}/gi;

	while ((results = pattern.exec(contents)) !== null) {
		if (results[1].indexOf(bind) >= 0) {
			exists = 1;
		}
	}

	return exists;
}

module.exports = new FindViewMatches();