'use strict';

	const { spawn } = require('child_process');
	const argv = require('yargs').argv;
	var colors = require('colors');

	var brand = new function(){
		var that 	  = this;
		const options = { shell: true };

		this.update = function(env,progressCall){
			if(env == undefined)
				env = 'default';
			that.run('cp', ['./src/projects/brand/'+env+'/*', './resources/'], function(st){
				if(st === true){
					that.run('ionic', ['cordova', 'resources'], function(){
						if(st === true){
							if(progressCall != undefined)
								progressCall();
						}
					});
				}
			});
		}

		this.run = function(command, args, onClose){
			console.log(colors.cyan(`> Starting: ${command} ${args.join(" ")}`));
			var sp = spawn(command, args, options);

			sp.stdout.on('data', function(data) {
			    process.stdout.write(`${data.toString()} \r`);
			});

			sp.stderr.on('data', function(data) {
				try{
			    	sp.stdin.write(data);
				}catch(err){
					console.log(data);
				}
			});

			sp.on('close', function(code) {
				if(code===0)
					console.log(colors.green(`> Finished: ${command} ${args.join(" ")} | code: ${code}`));
				else
			    	console.log(colors.red(`> Finished: ${command} ${args.join(" ")} | code: ${code}`));

			    if(onClose != undefined && code == 0)
			    	onClose(true);
			});
		}
	}

	exports.mod = brand;