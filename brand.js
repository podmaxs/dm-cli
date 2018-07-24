'use strict';

	var exec = require('child_process').exec;
	const argv = require('yargs').argv;
	var colors = require('colors');

	var brand = new function(){
		var that = this;

		this.update = function(env,progressCall){
			if(env == undefined)
				env = 'default';
			that.run('cp ./src/projects/brand/'+env+'/* ./resources/',function(st){
				if(st === true){
					that.run('ionic cordova resources ',function(){
						if(st === true){
							if(progressCall != undefined)
								progressCall();
						}
					});
				}
			});
		}

		this.run = function(cmd,onClose){
			console.log(colors.cyan('> ' + cmd + ' started:'));
			var sp=exec(cmd);

			sp.stdout.on('data', function(data) {
			    // console.log(data);
			    process.stdout.write("" + data.toString() + " \r");
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
					console.log(colors.green("> " + cmd + ' finished ' + code));
				else
			    	console.log(colors.red(cmd + ' finished ' + code));

			    if(onClose != undefined && code == 0)
			    	onClose(true);
			});
		}
	}

	exports.mod = brand;