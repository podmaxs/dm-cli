'use strict';

var fs       = require('fs'),
	identity = require('./identity'),
	exec     = require('child_process').exec,
	colors   = require('colors');

var signed = new function(){
	let self       = this,
		enviroment = process.env.BUILDER_ENV || "";


	this.deployApk = function(){
		enviroment = process.env.BUILDER_ENV || "";
		identity.mod.readBuilderEnvironment(enviroment)
		.then(
			conf => {
				if(conf['keystore'] && conf['keyalias'] && conf['storepass'] && conf['keypass']){
					self.run('cordova build android --release', function(){
						let apkpath = "platforms/android/build/outputs/apk/android-release-unsigned.apk",
							output  = enviroment+'-'+new Date().getTime()+".apk";
						self.run('jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore '+conf['keystore']+' -storepass '+conf['storepass']+'  -keypass '+conf['keypass']+' '+apkpath+' '+conf['keyalias'],function(){
							self.run('zipalign -v 4 '+apkpath+' '+output,function(){
								console.log(colors.green('>>> Singed '+output+' successfully created!'));
							})
						});
					});
				}else{
					console.log(colors.red("You need set keystore config for "+enviroment));
				}
			},
			err=> {
				console.log(colors.red(err));
			}
		)
	}



	this.run = function(cmd,onClose,onError){
		var sp = exec(cmd);

		sp.stdout.on('data', function(data) {
		    console.log(data);
		});

		sp.stderr.on('data', function(data, log) {
		   	//console.log(data,'errr ><><><><><>')
		    console.log(data);
		});

		sp.stdin.on('data', function(data) {
			//sp.stdin.write(data ,'><><><><');
		});

		sp.on('close', function(code) {
		    if(onClose != undefined && code == 0)
		    	onClose(true);
		});
	}

};

module.exports = signed;
