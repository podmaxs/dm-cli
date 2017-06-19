'use strict';

	let exec     = require('child_process').exec;
	let argv     = require('yargs').argv;
	let brand    = require('./brand');
	let colors   = require('colors');
	let config   = require('./identity');

	var git = new function(){

		var task = argv['_'];
		
		var that = this;
		
		this.cmd = [];

		this.commit = function (last_version,step) {
			var enviroment = process.env.BUILDER_ENV == 'default'?'bigApp':process.env.BUILDER_ENV;
			if(that.cmd.length == 0){
				var platform = "";
				if(task[1] != undefined)
					platform = task[1];
				var path = that.pathEnv(last_version);

				that.cmd.push('/usr/bin/git add .');

				that.cmd.push('/usr/bin/git tag -a ' + last_version + '.' + path  + ' -m "New build '+path+'" ');

				that.cmd.push('/usr/bin/git commit -am " New version of ' + platform + ' - ' + enviroment + ' ' + last_version + '"');

				that.cmd.push('/usr/bin/git push --all');

				that.cmd.push('/usr/bin/git push --follow-tags');
			}

			if(that.cmd[step] != undefined){
				that.run(that.cmd[step],function() {
					that.commit(last_version,step+1);
				});
			}else{
				console.log(colors.blue('>> COMMIT '+last_version+' - '+enviroment));
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

		this.run = function(cmd,onClose){
			var sp = exec(cmd);

			sp.stdout.on('data', function(data) {
			    console.log(data);
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
