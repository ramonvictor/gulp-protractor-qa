var esprima = require('esprima');
var traverse = require('ast-traverse');

function FindSelectors() {
}

FindSelectors.prototype.init = function(file) {
	this.file = file;

	return this.parseFileContent();
}

FindSelectors.prototype.parseFileContent = function() {
	var syntax = esprima.parse(this.file.content);
	var self = this;
	var selectors = [];

	traverse(syntax, {
		pre: function(node, parent, prop, idx) {
			self.eachNodeCheck(node, selectors);
		}
	});

	return selectors;
}

FindSelectors.prototype.eachNodeCheck = function(node, selectors) {
	if (node.type == 'CallExpression' && node.callee.object &&
		(node.callee.object.name === 'by' || node.callee.object.name === 'By')) {
		// Add it to selectors collection
		selectors.push({
			type: node.callee.property.name,
			value: node.arguments[0].value,
			path: this.file.path
		});
	}
}


module.exports = new FindSelectors();