'use strict';

	let exec     = require('child_process').exec;
	let argv     = require('yargs').argv;
	let brand    = require('./brand');
	let colors   = require('colors');
	let config   = require('./identity');
	let git      = require('./git');

	var builder  = new function(){
		var that = this;
		var task = argv['_'];


		this.create = function(){
			if(task.length>=1){
				var cmd = that.getCmd();
				if((task[0] == 'run' || task[0] == 'build' || task[0] == 'prepare' || task[0] == 'emulate') && argv.quick==undefined){
					config.mod.update(function(conf){
						brand.mod.update(process.env.BUILDER_ENV,function(){
							that.run(cmd,function(){
								git.mod.commit(conf.version,0);
							});
						});
					});
				}else{
					if((task[0] == 'switch')){
						config.mod.update(function(conf){
							if(task[1] == 'all'){
								that.reload_platform('android', function(){
									that.reload_platform('ios', function(){
										brand.mod.update(process.env.BUILDER_ENV,function(){
											console.log('switched to '+process.env.BUILDER_ENV);
										});		
									});
								});
							}else{
								if(task[1] == 'android' || task[1] == 'ios'){
									that.reload_platform(task[1], function(){
										brand.mod.update(process.env.BUILDER_ENV,function(){
											console.log('switched to '+process.env.BUILDER_ENV);
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
						if((task[0] == 'init')){
							config.mod.init(process.env.BUILDER_ENV);
						}else{
							that.run(cmd);
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
				that.run('ionic platform add '+platform, function(){
					call();
				})
			});
		}

		this.run = function(cmd,onClose){
			var sp = exec(cmd);

			sp.stdout.on('data', function(data) {
			    console.log(data);
			});

			sp.stderr.on('data', function(data,log) {
			    console.log(data);
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