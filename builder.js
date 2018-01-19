'use strict';

	let exec     = require('child_process').exec;
	let argv     = require('yargs').argv;
	let brand    = require('./brand');
	let colors   = require('colors');
	let config   = require('./identity');
	let git      = require('./git');
	let firebase = require('./firebaseApply'),
		singned  = require('./signRelase'),
		helpsrv  = require('./help');

	var builder  = new function(){
		var that = this;
		var task = argv['_'];

		this.reloadPLatforms = function(){
			that.reload_platform('android', function(){
				that.reload_platform('ios', function(){
					brand.mod.update(process.env.BUILDER_ENV,function(){
						that.run('cordova plugin add cordova-plugin-firebase@0.1.23', () => {
							firebase.apply(process.env.BUILDER_ENV)
							.then(()=>{
								console.log('switched to '+process.env.BUILDER_ENV);
							});
						})
					});		
				});
			});
		}
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
								console.log(colors.green('switching to '+process.env.BUILDER_ENV));
								that.run('cordova plugin rm cordova-plugin-firebase',
									() => {
										that.reloadPLatforms();
									},
									()=>{
										console.log(colors.green('error on cordova plugin rm cordova-plugin-firebase'));
										that.reloadPLatforms();
									});
							}else{
								if(task[1] == 'android' || task[1] == 'ios'){

									that.run('cordova plugin rm cordova-plugin-firebase',
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
													that.run('cordova plugin add cordova-plugin-firebase@0.1.23', () => {
														firebase.apply(process.env.BUILDER_ENV)
														.then(()=>{
															console.log('switched to '+process.env.BUILDER_ENV);
														});
													})
												});
											});
										});
									
								}else{
									brand.mod.update(process.env.BUILDER_ENV,function(){
										console.log('switched to '+process.env.BUILDER_ENV);
									});
								}
							}
							
						},false);
					}else{
						if(task[0] == 'signed'){
							if(task[1] == 'android'){
								singned.deployApk();
							}else{
								console.log("Signed build "+task[1]+" unavailable");
							}
						}else{
							if(task[0] == 'help' || task[0] == 'h'){
								helpsrv.getHelp();
							}else{
								if((task[0] == 'init')){
									config.mod.init(process.env.BUILDER_ENV);
								}else{
									if((task[0] == 'status')){
										console.log(colors.red("=================================================="));
										console.log(colors.green('Working on'));
										console.log(colors.red("=================================================="));
										config.mod.status(function () {
											if(argv.full){
												console.log(colors.red("=================================================="));
												console.log(colors.green("GIT"));
												that.run('git status');
											}else{
												console.log("Argument unavailable");
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
				console.log("The task builder is undefined ");
			}
		}

		this.getCmd = function(){
			let build    = ' serve ';
			let platform = ' ';
			if(argv.env != undefined)
				process.env.BUILDER_ENV = argv.env;
			else
				process.env.BUILDER_ENV = 'default';
			if(task[1] == 'android' || task[1] == 'ios' || task[1] == 'browser' || task[1] == 'window')
				platform=task[1];
			if(task[0] == 'run' || task[0] == 'serve' || task[0] == 'build' || task[0] == 'prepare' || task[0] == 'emulate')
				build = task[0];
			return 	'ionic '+build+' '+platform;
		}

		this.reload_platform = function(platform,call){
			that.run('cordova platform rm '+platform,function(){
				that.run('cordova platform add '+platform, function(){
					call();
				})
			});
		}

		this.run = function(cmd,onClose,onError){
			var sp = exec(cmd);

			sp.stdout.on('data', function(data) {
			    console.log(data);
			});

			sp.stderr.on('data', function(data,log) {
			    console.log(data);
			    if(onError != undefined)
			    	onError(true);
			});

			sp.stdin.on('data', function(data) {
				sp.stdin.write(data);
			});

			sp.on('close', function(code) {
			    console.log(colors.green(cmd + ' finished ' + code));
			    if(onClose != undefined && code == 0)
			    	onClose(true);
			});
		}
	}
	exports.mod = builder;