#!/usr/bin/env node

'use strict';

	let brand     = require('./brand');
	let builder   = require('./builder');
	let config    = require('./identity');
	
	exports.modules = {
		'builder':builder.mod,
		'brand':brand.mod,
		'conf':config.mod
	};