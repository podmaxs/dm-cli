'use strict';

	const fs   = require('fs');
	const argv = require('yargs').argv;
	var colors = require('colors');

	var config = new function(){
		var that  = this,
			pwd   = process.env.PWD;

		this.conf = {};

		this.update = function(onSave,incremental){
			incremental = incremental!=undefined?incremental:true;
			fs.readFile(pwd+'/config.xml', 'utf8', function (err,data) {
			  if (err) {
			    return console.log(colors.red(err));
			  }
			  that.getEnviromentData(function(configApp){
			  	that.conf    = configApp;
				  var widget = ' id="'+configApp.app_id+'" version="'+configApp.version+'" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0" ';
				  
				  var header = that.strip_str(data,widget,'<widget','>');
				  header     = that.strip_str(header,configApp.name,'<name>','</name>');
				  header     = that.strip_str(header,configApp.description,'<description>','</description>');
				  let autor  = ' email="'+configApp.autor_email+'" href="'+configApp.auro_url+'">'+configApp.autor;
				  header     = that.strip_str(header,autor,'<author','</author>');
				  that.saveConfig(header,onSave);
			  },
			  function(){
			  	console.log(colors.red('Error on save config.xml'));
			  },
			  incremental);
			});

		};

		this.getEnviromentData = function(onGetEnviroments,error,incremental){
			let def = {
				app_id      : 'com.dymns.bigapp',
				version     : '0.0.1',
				name        : 'bigApp',
				description : 'The bigApp Project',
				autor       : 'podmaxs',
				autor_email : 'podmaxs@gmail.com',
				auro_url    : 'http://dynamicmind.com'
			};
			that.createEnviromentData(def,onGetEnviroments,error,incremental);
		};

		this.init = function(proyectKey){
			let rootFile = pwd+'/builder.config.json';
			let def = {
				app_id      : 'com.dymns.'+proyectKey,
				version     : '0.0.1',
				name        : proyectKey,
				description : 'The '+proyectKey+' project',
				autor       : 'podmaxs',
				autor_email : 'dev@dynamicmind.com',
				auro_url    : 'http://dynamicmind.com'
			};

			fs.readFile(rootFile, 'utf8', function (err,data) {
				let ndata = {},
					error = false;
				if (err) {
			    	ndata[proyectKey] = def;
				}else{
					ndata = JSON.parse(data);
					if(ndata[proyectKey] == undefined){
				  		ndata[proyectKey] = def;
					}else{
						error = true;
					}
			  	}
			  	if(ndata[proyectKey] != undefined && !error){
			  		let json = JSON.stringify(ndata);
					json = that.replaceAll(json,'","','",\n"');
					json = that.replaceAll(json,'{"','{\n"');
					json = that.replaceAll(json,'}','}\n');
					json = that.replaceAll(json,'"}','"\n}');
					fs.writeFile(rootFile, json, function(err) {
			       		if(err) {
			           		console.log(err);
			       		}else{
			       			console.log('The '+proyectKey+' was created');
			       		}
			   		}); 
			  	}else{
			  		console.log('Error: The '+proyectKey+' project already exist');
			  	}
			});
		}


		this.createEnviromentData = function(def,onGetEnviroments,error,incremental){
			fs.readFile(pwd+'/builder.config.json', 'utf8', function (err,data) {
			  if (err) {
			  	if(error)
			  		error();
			    return console.log(err);
			  }else{
				  let conf = JSON.parse(data);
				  that.conf = conf;
				  if(typeof conf == typeof {})
				  	that.parseConf(conf[process.env.BUILDER_ENV],def,onGetEnviroments,incremental);
			  }
			});
		};

		this.readBuilderEnvironment = function(env){
			return new Promise((resolve, reject) =>{
				fs.readFile(pwd+'/builder.config.json', 'utf8', function (err,data) {
				  	if(err){
				    	reject(err);
				  	}else{
					  	let conf = JSON.parse(data) || {};
					  	resolve(conf[env] || conf['default']);
				 	}
				});
			});
		}

		this.parseConf = function(d,def,onGetEnviroments,incremental){
			for(let k in d)
				def[k]=d[k];
			onGetEnviroments(that.upVersionApp(def,incremental));
		};

		this.upVersionApp = function(d,incremental){
			let version      = d['version'],
				vs           = version.split('.');
			if(vs[2]){
				let nv = incremental?eval(parseInt(vs[2])+1):eval(parseInt(vs[2]));
				version      = vs[0] + '.' + vs[1] +  '.'  + nv;
				d['version'] = version;
			}
			if(that.conf[process.env.BUILDER_ENV]){
				that.conf[process.env.BUILDER_ENV]=d;
				that.saveConfigProject(that.conf);
			}
			return d;
		};

		this.saveConfigProject = function(body){
			let json = JSON.stringify(body);
			json = that.replaceAll(json,'","','",\n"');
			json = that.replaceAll(json,'{"','{\n"');
			json = that.replaceAll(json,'}','}\n');
			json = that.replaceAll(json,'"}','"\n}');
			fs.writeFile(pwd+"/builder.config.json", json, function(err) {
			       if(err) {
			           return console.log(err);
			       }
			   }); 
		};

		this.saveConfig = function(body,onSave){
			fs.writeFile("./config.xml", body, function(err) {
			       if(err) {
			           return console.log(err);
			       }
			       if(onSave != undefined)
			       	onSave(that.conf);
			       console.log(colors.green("> " + process.env.BUILDER_ENV + " config.xml saved!"));
			   }); 
		};

		this.strip_str = function(data,wg,startKey,endKey){
			if(data.indexOf(startKey) != -1 && data.indexOf(endKey) != -1){
				var header  = '';
				var body    = data.split(startKey);
				header      = body[0] + startKey + wg;
				var body2   = body[1].split(endKey);
				for(let p = 0; p < body2.length; p++)
					if(p != 0)
						if(p != (body2.length - 1))
							header+=body2[p] + endKey;
						else
							header+=body2[p];
					else
						header+=endKey;
			}else{
				return data;
			}
			return header;
		};

		this.replaceAll = function(data,search, replacement) {
			return data.replace(new RegExp(search, 'g'), replacement);
		};

		this.status = function(onClose){
			fs.readFile(pwd+'/config.xml', 'utf8', function (err,data) {
				if (err) {
				  	return console.log(colors.red(err));
				} else {
					if(data.indexOf('<widget id="') != -1 && data.indexOf('" version="') != -1){
						var info = {
							package: data.split('<widget id="')[1].split('" version="')[0],
							version: data.split('version="')[1].split('" xmlns="')[0],
							project: data.split('<name>')[1].split('</name>')[0],
							description: data.split('<description>')[1].split('</description>')[0]
						}
						console.log(colors.green('Project: ')+info.project);
						console.log(colors.green('Descrip: ')+info.description);
						console.log(colors.green('Version: ')+info.version);
						console.log(colors.green('Package: ')+info.package);
						if(onClose != undefined)
			    			onClose();
						return info;
					}
				}
			});
		};
	};

	exports.mod = config;

