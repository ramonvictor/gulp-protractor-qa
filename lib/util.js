var utilConfig = { 
	regexList : [ 
		{
			type : "attr",
			attrName : "ng-model",
			match :  /by\.model\(\s*['|"](.*?)['|"]\s*\)/gi
		},
		{
			type : "attr",
			attrName : "ng-repeat",
			match : /by\.repeater\(\s*['|"](.*?)['|"]\s*\)/gi
		},
		{
			type : "cssAttr", 
			match : /by\.css\(\s*['|"](.*?)['|"]\s*\)/gi
		},
		{
			type : "attr", 
			attrName : "ng-bind",
			match : /by\.binding\(\s*['|"](.*?)['|"]\s*\)/gi
		},
		{
			type: "attr",
			attrName : "ng-repeat",
			match: /by\.repeater\(\s*['|"](.*? in .*?)['|"]\s*\)/gi
		}
	],

	getRegexList : function(){
		return this.regexList;
	}
};

module.exports = utilConfig;
