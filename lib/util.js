var utilConfig = {
	regexList : [
		{
			type : "attr",
			attrName : "ng-model",
			match :  /[b|B]y\.model\(\s*['|"](.*?)['|"]\s*\)/gi
		},
		{
			type : "attr",
			attrName : "data-ng-model",
			match :  /[b|B]y\.model\(\s*['|"](.*?)['|"]\s*\)/gi
		},
		{
			type : "attr",
			attrName : "ng-repeat",
			match : /[b|B]y\.repeater\(\s*['|"](.*?)['|"]\s*\)/gi
		},
		{
			type : "attr",
			attrName : "data-ng-repeat",
			match : /[b|B]y\.repeater\(\s*['|"](.*?)['|"]\s*\)/gi
		},
		{
			type : "cssAttr",
			match : /[b|B]y\.css\(['|"]\[(.+=.+)\]['|"]\)/gi
		},
		{
			type : "attr",
			attrName : "ng-bind",
			match : /[b|B]y\.binding\(\s*['|"](.*?)['|"]\s*\)/gi
		},
		{
			type : "attr",
			attrName : "data-ng-bind",
			match : /[b|B]y\.binding\(\s*['|"](.*?)['|"]\s*\)/gi
		},
		{
			type: "attr",
			attrName : "ng-repeat",
			match: /[b|B]y\.repeater\(\s*['|"](.*? in .*?)['|"]\s*\)/gi
		},
		{
			type: "attr",
			attrName : "data-ng-repeat",
			match: /[b|B]y\.repeater\(\s*['|"](.*? in .*?)['|"]\s*\)/gi
		}
	],

	getRegexList : function(){
		return this.regexList;
	}
};

module.exports = utilConfig;
