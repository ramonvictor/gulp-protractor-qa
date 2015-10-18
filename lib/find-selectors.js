var esprima = require('esprima');
var traverse = require('ast-traverse');

function FindSelectors() {
	this.selectors = [];
}

FindSelectors.prototype.init = function(file) {
	this.file = file;

	return this.parseFileContent();
}

FindSelectors.prototype.parseFileContent = function() {
	var syntax = esprima.parse(this.file.content);
	var self = this;

	traverse(syntax, {
		pre: function(node, parent, prop, idx) {
			self.eachNodeCheck(node);
		}
	});

	return self.selectors;
}

FindSelectors.prototype.eachNodeCheck = function(node) {
	if (node.type == 'CallExpression' && node.callee.object &&
		(node.callee.object.name === 'by' || node.callee.object.name === 'By')) {
		// Add it to selectors collection
		this.selectors.push({
			type: node.callee.property.name,
			value: node.arguments[0].value,
			path: this.file.path
		});
	}
}


module.exports = new FindSelectors();