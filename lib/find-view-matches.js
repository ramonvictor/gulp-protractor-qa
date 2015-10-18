var cheerio = require('cheerio');

function FindViewMatches() {
	this.$ = function() {};

	this.$get = {
		binding : function(value) {
			return [
				'[ng-bind="', value, '"], ',
				'[data-ng-bind="', value, '"]'
			].join('');
		},
		repeater: function(value) {
			return [
				'[ng-repeat="', value, '"], ',
				'[data-ng-repeat="', value, '"]'
			].join('');
		},
		css: function(value) {
			return value;
		}
	}
}

FindViewMatches.prototype.init = function(selectors, content) {
	var self = this;
	this.$ = cheerio.load(content);

	selectors.forEach(function(selector) {
		var selectorString = '';

		if (self.$get[selector.type]) {
			selectorString = self.$get[selector.type](selector.value);
		}

		if (self.$(selectorString).length) {
			selector.found = 1;
		}

		if (selector.type === 'binding' && !selector.found) {
			selector.found = bindExists(selector.value, content);
		}
	});
}


function bindExists(bind, contents) {
	var results;
	var exists = 0;
	var pattern = /{{(.*?)}}/gi;

	while ((results = pattern.exec(contents)) !== null) {
		if (results[1].indexOf( bind ) >= 0) {
			exists = 1;
		}
	}

	return exists;
}

module.exports = new FindViewMatches();