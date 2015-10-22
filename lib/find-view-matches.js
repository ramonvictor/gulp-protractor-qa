var cheerio = require('cheerio');

function FindViewMatches(selectors, content) {
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
			return prefixSelector('#', value);
		},
		className: function(value) {
			return prefixSelector('.', value);
		},
		name: function(value) {
			return attrSelector('name', value);
		}
	};

	loopSelectors.call(this, selectors, content);
}

function loopSelectors(selectors, content) {
	var self = this;
	var $ = cheerio.load(content);

	selectors.forEach(function(selector) {
		var selectorString = '';
		var value = selector.value;
		var type = selector.type;

		if (!self.by[type] && type !== 'binding') {
			selector.disabled = 1;
			return;
		} else {
			selectorString = self.by[type](value);
		}

		if ($(selectorString).length) {
			selector.found = 1;
		}

		var byBinding = self.by['binding'](value);
		if (type === 'binding' &&
			($(byBinding).length || bindExists(value, content))) {
			selector.found = 1;
		}
	});
}

function attrSelector(attr, value) {
	return [
		'[ng-', attr, '="', value, '"], ',
		'[data-ng-', attr, '="', value, '"]'
	].join('');
}

function prefixSelector(prefix, value) {
	value.replace(new RegExp('^\'+ prefix +'?(.*)$', 'i'), function (match) { return prefix + match });
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
