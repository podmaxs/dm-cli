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
					that.run('ionic resources ',function(){
						if(st === true){
							if(progressCall != undefined)
								progressCall();
						}
					});
				}
			});
		}

		this.run = function(cmd,onClose){
			var sp=exec(cmd);

			sp.stdout.on('data', function(data) {
			    console.log(data);
			});

			sp.stderr.on('data', function(data) {
			    console.log(data);
			});

			sp.on('close', function(code) {
			    if(onClose != undefined && code == 0)
			    	onClose(true);
			});
		}
	}

	exports.mod = brand;