'use strict';

	let exec     = require('child_process').exec;
	let argv     = require('yargs').argv;
	let brand    = require('./brand');
	let colors   = require('colors');
	let config   = require('./identity');
	let git      = require('./git');
	let firebase = require('./firebaseApply'),
		singned  = require('./signRelase'),
		helpsrv  = require('./help'),
		rl 		 = require('readline');

	var builder  = new function(){
		var that = this;
		var task = argv['_'];
		const options = {
		  maxBuffer: 2000 * 1024
		};

		/**
		 * 
		 * 
		 */
		this.create = function(){
			if(task.length>=1){
				var cmd = that.getCmd();
				
				if((task[0] == 'run' || task[0] == 'build' || task[0] == 'prepare' || task[0] == 'emulate') && argv.quick==undefined){
					firebase.apply(process.env.BUILDER_ENV)
					.then(()=>{
						config.mod.update(function(conf){
							brand.mod.update(process.env.BUILDER_ENV,function(){
								that.run(cmd,function(){
									git.mod.commit(conf.version,0);
								});
							});
						});
					});
				}else{
					if((task[0] == 'switch')){
						config.mod.update(function(conf){
							if(task[1] == 'all'){
								console.log(colors.green('> Switching to '+process.env.BUILDER_ENV));
								that.run('ionic cordova plugin rm cordova-plugin-firebase',
									() => {
										that.reloadPLatforms();
									},
									()=>{
										console.log(colors.green('error on cordova plugin rm cordova-plugin-firebase'));
										that.reloadPLatforms();
									});
							}else{
								if(task[1] == 'android' || task[1] == 'ios'){

									that.run('ionic cordova plugin rm cordova-plugin-firebase',
										() => {
											that.reload_platform(task[1], function(){
												brand.mod.update(process.env.BUILDER_ENV,function(){
													that.run('cordova plugin add cordova-plugin-firebase@0.1.23', () => {
														firebase.apply(process.env.BUILDER_ENV)
														.then(()=>{
															console.log('switched to '+process.env.BUILDER_ENV);
														});
													});
												});
											});
										},
										()=>{
											that.reload_platform(task[1], function(){
												brand.mod.update(process.env.BUILDER_ENV,function(){
													that.run('ionic cordova plugin add cordova-plugin-firebase@0.1.23', () => {
														firebase.apply(process.env.BUILDER_ENV)
														.then(()=>{
															console.log('> Switched to '+process.env.BUILDER_ENV);
														});
													})
												});
											});
										});
									
								}else{
									brand.mod.update(process.env.BUILDER_ENV,function(){
										console.log('> Switched to '+process.env.BUILDER_ENV);
									});
								}
							}
						},false);
					}else{
						if(task[0] == 'signed'){
							if(task[1] == 'android'){
								singned.deployApk();
							}else{
								console.log(colors.red("> Signed build for "+task[1]+" unsupported. Use android platform."));
							}
						}else{
							if(task[0] == 'help' || task[0] == 'h'){
								helpsrv.getHelp();
							}else{
								if((task[0] == 'init')){
									config.mod.init(process.env.BUILDER_ENV);
								}else{
									if(task[0] == 'status'){
										console.log(colors.green("==================================================\n >> Working on << \n=================================================="));
										config.mod.status(function () {
											console.log(colors.green("=================================================="));
											if(argv.full){
												console.log(colors.inverse("GIT"));
												that.run('git status');
											}
										});
									}else{
										firebase.apply(process.env.BUILDER_ENV)
										.then(()=>{
											that.run(cmd);	
										});
									}
								}
							}
						}
					}
				}
			}else{
				console.log(colors.red("> The task builder is undefined"));
			}
		}

		/**
		 * Build command to execute
		 * @return {string} 
		 */
		this.getCmd = function(){
			let build    = ' serve ';
			let platform = ' ';
			if(argv.env != undefined)
				process.env.BUILDER_ENV = argv.env;
			else
				process.env.BUILDER_ENV = 'default';
			if(task[1] == 'android' || task[1] == 'ios' || task[1] == 'browser' || task[1] == 'window')
				platform=task[1];
			if(task[0] == 'build' || task[0] == 'compile' || task[0] == 'emulate' || task[0] == 'prepare' || task[0] == 'run' || task[0] == 'serve')
				build = 'cordova ' + task[0];
				//build = task[0];
			return 'ionic '+build+' '+platform+' --verbose';
		}

		/**
		 * Reload both platforms and add Firebase 0.1.23 plugin to project
		 * @return {string} Result log
		 */
		this.reloadPLatforms = function(){
			that.reload_platform('android', function(){
				that.reload_platform('ios', function(){
					brand.mod.update(process.env.BUILDER_ENV,function(){
						that.run('cordova plugin add cordova-plugin-firebase@0.1.23', () => {
							firebase.apply(process.env.BUILDER_ENV)
							.then(()=>{
								console.log(colors.green('> Switched to '+process.env.BUILDER_ENV));
							});
						})
					});		
				});
			});
		}

		/**
		 * Remove and add platform
		 * 
		 * @param  {string} 	platform "ios" | "android"
		 * @param  {function} 	call     callback
		 */
		this.reload_platform = function(platform,call){
			that.run('ionic cordova platform rm '+platform, function(){
					that.run('ionic cordova platform add '+platform, function(){
						call();
					});
				},
				() => {
					console.log(colors.red('error on cordova platform rm '+platform));
					that.ask('Do you want to try again? (Yes / No)', function(answer) {
						if(answer != undefined && answer != ''){
							if(answer === 'yes'||answer === 'Yes'||answer === 'YES'){
					  			that.run('ionic cordova platform rm ios && ionic cordova platform add ios && ionic cordova plugin add cordova-plugin-firebase@0.1.23', function(){
									that.reloadPLatforms();
								});
							}
						}
					});
				}
			);
		}

		this.run = function(cmd,onClose,onError){
			var sp = exec(cmd, options);

			sp.stdout.on('data', function(data) {
			    console.log(data);
			});

			sp.stderr.on('data', function(data,log) {
			    console.log(colors.red(data));
			    if(onError != undefined)
			    	onError(true);
			});

			sp.stdin.on('data', function(data) {
				sp.stdin.write(data);
			});

			sp.on('close', function(code) {
				if(code==0)
			    	console.log(colors.green(cmd + ' finished ' + code));
			    else
			    	console.log(colors.red(cmd + ' finished ' + code));
			    
			    if(onClose != undefined && code == 0)
			    	onClose(true);
			});
		}

		this.ask = function(question, callback) {
	  		var r = rl.createInterface({
			    input: process.stdin,
			    output: process.stdout
			});
		  
		  	r.question(question + '\n', function(answer) {
		    	r.close();
		    	callback(answer);
		  	});
		}

	}
	exports.mod = builder;