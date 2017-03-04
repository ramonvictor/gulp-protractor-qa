'use strict';

var cheerio = require('cheerio');
var by = {
	binding: function(value) {
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
		return prefixSelector('#', value);
	},
	className: function(value) {
		return prefixSelector('.', value);
	},
	name: function(value) {
		return attrSelector('name', value);
	},
	tagName: function(value) {
		return attrSelector('tagName', value);
	}
};

function FindViewMatches(selectors, content) {
	loopSelectors(selectors, content);
}

function loopSelectors(selectors, content) {
	var $ = cheerio.load(content);

	selectors.forEach(function(selector) {
		var selectorString = '';
		var value = selector.value;
		var type = selector.type;

		if (!by[type] && type !== 'binding') {
			selector.disabled = 1;
			return;
		} else {
			selectorString = by[type](value);
		}

		if ($(selectorString).length) {
			selector.found = 1;
		}

		var byBinding = by.binding(value);
		if (type === 'binding' &&
			($(byBinding).length || bindExists(value, content))) {
			selector.found = 1;
		}
	});
}

function attrSelector(attr, value) {
	// 'ng:' excluded, since it's not a `cheerio` valid selector.
	var ngPrefixes = ['ng-', 'ng_', 'data-ng-', 'x-ng-'];
	var output = [];

	for (var i = 0; i < ngPrefixes.length; i = i + 1) {
		output.push(
			'[' + ngPrefixes[i] + attr + '="' + value + '"]' +
			(i === (ngPrefixes.length - 1) ? '' : ', ')
		);
	}

	return output.join('');
}

function prefixSelector(prefix, value) {
	return value.indexOf(prefix) === 0 ? value : prefix + value;
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

module.exports = FindViewMatches;
