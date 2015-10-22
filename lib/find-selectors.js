var esprima = require('esprima');
var traverse = require('ast-traverse');

function FindSelectors() {
}

FindSelectors.prototype.init = function(file) {
	this.file = file;

	return this.parseFileContent();
}

FindSelectors.prototype.parseFileContent = function() {
	var syntax = esprima.parse(this.file.content, {
		loc: true
	});
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
		node.callee.object.name && node.callee.object.name.toLowerCase() === 'by') {
		var lineInfo = node.arguments[0].loc.start;
		var lineAndColumn = lineInfo.line + ':' + lineInfo.column;

		// Add it to selectors collection
		selectors.push({
			type: node.callee.property.name,
			value: node.arguments[0].value,
			path: this.file.path,
			line: lineAndColumn
		});
	}
}


module.exports = new FindSelectors();
