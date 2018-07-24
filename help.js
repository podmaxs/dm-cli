'use strict';

var fs = require('fs'),
	colors   = require('colors');

var help = new function(){

	this.getHelp = function(){
		var contents = fs.readFileSync(__dirname+'/helpInfo.dm').toString();
		console.log(colors.green(contents));
	}
};
module.exports = help;