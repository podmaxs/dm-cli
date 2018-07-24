'use strict';

	const { spawn } = require('child_process');
	let argv     = require('yargs').argv;
	let brand    = require('./brand');
	let colors   = require('colors');
	let config   = require('./identity');

	var git = new function(){

		var task = argv['_'];
		const options = { shell: true };
		
		var that = this;
		
		this.cmd = [];

		this.commit = function (last_version,step) {
			var enviroment = process.env.BUILDER_ENV == 'default'?'bigApp':process.env.BUILDER_ENV;
			if(that.cmd.length == 0){
				var platform = "";
				if(task[1] != undefined)
					platform = task[1];
				var path = that.pathEnv(last_version);

				that.cmd.push(['add', '.']);
				that.cmd.push(['tag', '-a', `${last_version}.${path}`, '-m', `New build ${path}` ]);
				that.cmd.push(['commit', '-am', `New version of ${platform} - ${enviroment} ${last_version}`]);
				that.cmd.push(['push', '--all']);
				that.cmd.push(['push', '--follow-tags']);
			}

			if(that.cmd[step] != undefined){
				that.run('git', that.cmd[step], function() {
					that.commit(last_version,step+1);
				});
			}else{
				console.log(colors.blue(`>>> COMMIT ${last_version} - ${enviroment}`));
			}
		};

		this.pathEnv = function (last_version) {
			var enviroment = process.env.BUILDER_ENV == 'default'?'bigApp':process.env.BUILDER_ENV;
			var sv = that.replaceAll(last_version+"",".","");
			return enviroment + '_v' + sv;
		};

		this.replaceAll = function(data,search, replacement) {
			while(data.indexOf(search) != -1)
				data=data.replace(search,replacement);
			return data;
		};

		this.run = function(command,args,onClose){
			console.log(colors.cyan(`> Starting: ${command} ${args.join(" ")}`));
			var sp = spawn(command, args, options);

			sp.stdout.on('data', function(data) {
			    process.stdout.write(`${data.toString()} \r`);
			});

			sp.stderr.on('data', function(data) {
			    sp.stdin.write(data);
			});

			sp.on('close', function(code) {
			    if(onClose != undefined && code == 0)
			    	onClose(true);
			});
		};
	}

	exports.mod = git;
