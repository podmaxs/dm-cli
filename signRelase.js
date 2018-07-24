'use strict';

var fs       = require('fs'),
	identity = require('./identity'),
	exec     = require('child_process').exec,
	colors   = require('colors');

var signed = new function(){
	let self       = this,
		enviroment = process.env.BUILDER_ENV || "";

	/**
	 * Build, optimize & verify a signed apk for production. 
	 * @return {[type]} [description]
	 */
	this.deployApk = function(){
		enviroment = process.env.BUILDER_ENV || "";
		identity.mod.readBuilderEnvironment(enviroment)
		.then(
			conf => {
				if(conf['keystore'] && conf['keyalias'] && conf['storepass'] && conf['keypass']){
					self.run('ionic cordova build android --prod --release', function(){
						let apkpath = "platforms/android/build/outputs/apk/android-release-unsigned.apk",
							output  = '../deploy/'+conf['version']+enviroment+'-'+new Date().getTime()+".apk";
						// Sign
						self.run('jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore '+conf['keystore']+' -storepass '+conf['storepass']+'  -keypass '+conf['keypass']+' '+apkpath+' '+conf['keyalias'],function(){
							console.log(colors.green('>>> Singed '+output+' successfully created!'));
							// Optimize
							self.run('zipalign -v 4 '+apkpath+' '+output,function(){
								console.log(colors.green('>>> '+output+' optimized!'));
								// Verify
								self.run('apksigner verify '+output, function(){
									console.log(colors.green('>>> '+apkpath+' sign verified!'));
									// Clean tmp
									self.run('rm '+apkpath, function(){
										console.log(colors.green('>>> Temp '+apkpath+' deleted!'));
									}, function(){
										console.log(colors.red("Error removing "+apkpath));
									});

								}, function(){
									console.log(colors.red("Error verifying the apk!"));
								});

							}, function(){
								console.log(colors.red("Error optimizing the apk!"));
							});

						}, function(){
							console.log(colors.red("Error signing the apk!"));
						});

					});
				}else{
					console.log(colors.red("You need set keystore config for "+enviroment));
				}
			},
			err => {
				console.log(colors.red(err));
			}
		)
	}



	this.run = function(cmd,onClose,onError){
		console.log(colors.cyan('> ' + cmd + ' started:'));
		var sp = exec(cmd);

		sp.stdout.on('data', function(data) {
		    // console.log(data);
		    process.stdout.write("" + data.toString() + " \r");
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
