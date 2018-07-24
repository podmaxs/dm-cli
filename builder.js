'use strict';

	const { spawn } = require('child_process');
	let	argv     = require('yargs').argv,
		brand    = require('./brand'),
		colors   = require('colors'),
		config   = require('./identity'),
		git      = require('./git'),
		firebase = require('./firebaseApply'),
		singned  = require('./signRelase'),
		helpsrv  = require('./help'),
		rl 		 = require('readline');

	var builder  = new function(){
		var that = this,
			task = argv['_'],
			fireVersion = 'cordova-plugin-firebase@0.1.23';

		const options = { shell: true };

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
								that.run(cmd.command, cmd.argumentos, function(){
									git.mod.commit(conf.version, 0);
								});
							});
						});
					});
				}else{
					if((task[0] == 'switch')){
						config.mod.update(function(conf){
							if(task[1] == 'all'){
								console.log(colors.green(`> Switching to ${process.env.BUILDER_ENV}`));
								that.run('ionic', ['cordova', 'plugin', 'rm', 'cordova-plugin-firebase'],
									function(){
										that.reloadPLatforms();
									},
									function(){
										console.log(colors.red('error on cordova plugin rm cordova-plugin-firebase'));
										that.reloadPLatforms();
									});
							}else{
								if(task[1] == 'android' || task[1] == 'ios'){

									that.run('ionic', ['cordova', 'plugin', 'rm', 'cordova-plugin-firebase'],
										() => {
											that.reload_platform(task[1], function(){
												brand.mod.update(process.env.BUILDER_ENV,function(){
													that.run('ionic', ['cordova', 'plugin', 'add', fireVersion], () => {
														firebase.apply(process.env.BUILDER_ENV)
														.then(()=>{
															console.log(`> Switched to ${process.env.BUILDER_ENV}`);
														});
													});
												});
											});
										},
										() => {
											that.reload_platform(task[1], function(){
												brand.mod.update(process.env.BUILDER_ENV,function(){
													that.run('ionic', ['cordova', 'plugin', 'add', fireVersion], () => {
														firebase.apply(process.env.BUILDER_ENV)
														.then(()=>{
															console.log(`> Switched to ${process.env.BUILDER_ENV}`);
														});
													})
												});
											});
										});
									
								}else{
									brand.mod.update(process.env.BUILDER_ENV,function(){
										console.log(`> Switched to ${process.env.BUILDER_ENV}`);
									});
								}
							}
						},false);
					} else {
						if(task[0] == 'signed'){
							if(task[1] == 'android'){
								singned.deployApk();
							} else {
								console.log(colors.red(`> Signed build for ${task[1]} unsupported. Use android platform.`));
							}
						} else {
							if(task[0] == 'help' || task[0] == 'h'){
								helpsrv.getHelp();
							} else {
								if((task[0] == 'init')){
									config.mod.init(process.env.BUILDER_ENV);
								} else {
									if(task[0] == 'status'){
										console.log(colors.green("==================================================\n >> Working on << \n=================================================="));
										config.mod.status(function (){
											console.log(colors.green("=================================================="));
											if(argv.full){
												console.log(colors.green("GIT"));
												that.run('git', ['status']);
											}
										});
									} else {
										// Run debug | serve
										firebase.apply(process.env.BUILDER_ENV)
										.then(()=>{
											that.run(cmd.command, cmd.arguments);	
										});
									}
								}
							}
						}
					}
				}
			} else {
				console.log(colors.red("> The task builder is undefined"));
			}
		}

		/**
		 * Build command to execute
		 * @return {string} 
		 */
		this.getCmd = function(){
			let executable 	= 'ionic',
				tarea      	= 'serve',
				platform 	= ' ',
				argumentos  = [];

			if(argv.env != undefined)
				process.env.BUILDER_ENV = argv.env;
			else
				process.env.BUILDER_ENV = 'default';

			if(task[1] == 'android' || task[1] == 'ios' || task[1] == 'browser' || task[1] == 'window')
				platform = task[1];
			
			if(task[0] == 'build' || task[0] == 'compile' || task[0] == 'emulate' || task[0] == 'prepare' || task[0] == 'run')
				tarea = task[0];

			if(tarea != 'serve'){
				argumentos = [
				  'cordova',
				  tarea,
				  platform,
				  '--verbose',
				].concat(argv.quick==undefined ? ['--prod', '--release'] : []);
			} else {
				argumentos = [ tarea ];
			}

			return { 
				command: executable, 
				arguments: argumentos
			};
			
		}

		/**
		 * Reload both platforms and add Firebase 0.1.23 plugin to project
		 * @return {string} Result log
		 */
		this.reloadPLatforms = function(){
			that.reload_platform('android', function(){
				that.reload_platform('ios', function(){
					brand.mod.update(process.env.BUILDER_ENV,function(){
						that.run('ionic', ['cordova', 'plugin', 'add', fireVersion], () => {
							firebase.apply(process.env.BUILDER_ENV)
							.then(()=>{
								console.log(colors.green(`> Switched to ${process.env.BUILDER_ENV}`));
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
			that.run('ionic', 
				['cordova', 'platform', 'rm', platform ], 
				function(){
					that.run('ionic', ['cordova', 'platform', 'add', platform ], function(){
						call();
					});
				},
				function(){
					console.log(colors.red(`error on ionic cordova platform rm ${platform}`));
					that.ask('Do you want to try again? (Yes / No)', function(answer) {
						if(answer != undefined && answer != ''){
							if(answer === 'yes'||answer === 'Yes'||answer === 'YES'){
					  			// that.run('ionic cordova platform rm '+platform+' && ionic cordova platform add '+platform+' && ionic cordova plugin add cordova-plugin-firebase@0.1.23', function(){
								// 	that.reloadPLatforms();
								// });
							} else {
								console.log(colors.red(`>>> Try again with: `));
								console.log(colors.cyan(`ionic cordova platform rm ios && ionic cordova platform add ios && ionic cordova plugin add ${fireVersion}`))
							}
						}
					});
				}
			);
		}

		this.run = function(command, args, onClose, onError){
			console.log(colors.cyan(`> Starting: ${command} ${args.join(" ")}`));

			var sp = spawn(command, args, options);

			sp.stdout.on('data', function(data) {
			    process.stdout.write(`${data.toString()} \r`);
			});

			sp.stderr.on('data', function(data,log) {
				process.stderr.write(colors.red(data.toString()));
			    if(onError != undefined)
			    	onError(true);
			});

			sp.stdin.on('data', function(data) {
				sp.stdin.write(data);
			});

			sp.on('close', function(code) {
				if(code===0)
			    	console.log(colors.green(`> Finished: ${command} ${args.join(" ")} | code: ${code}`));
			    else
			    	console.log(colors.red(`> Finished: ${command} ${args.join(" ")} | code: ${code}`));
			    
			    if(onClose != undefined && (code == 0 || (code != 0 && task[0] === 'run' && argv.quick==undefined)))
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