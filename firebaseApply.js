'use strict';

var fs = require('fs');

var firebase = new function(){
    var self = this;
    this.getValue = function(config, name) {
        var value = config.match(new RegExp('<' + name + '>(.*?)</' + name + '>', "i"))
        if(value && value[1]) {
            return value[1]
        } else {
            return null
        }
    }

    this.fileExists = function(path) {
      try  {
        return fs.statSync(path).isFile();
      }
      catch (e) {
        return false;
      }
    }

    this.directoryExists = function(path) {
      try  {
        return fs.statSync(path).isDirectory();
      }
      catch (e) {
        return false;
      }
    }

    this.checkDir = function(dir){
      if (!fs.existsSync(dir)){
          fs.mkdirSync(dir);
      }
    }

    this.apply = function(env){
      return new Promise((resolve) =>{
        var config = fs.readFileSync("config.xml").toString(),
            name   = self.getValue(config, "name")
        if (self.directoryExists("platforms/ios")) {
          var paths = ["src/projects/firebase/"+env+"/GoogleService-Info.plist"];

          for (var i = 0; i < paths.length; i++) {
            if (self.fileExists(paths[i])) {
              try {
                var contents = fs.readFileSync(paths[i]).toString();
                fs.writeFileSync("platforms/ios/" + name + "/Resources/GoogleService-Info.plist", contents);
                //that.checkDir("platforms/ios/" + name + "/Resources/Resources/");
                fs.writeFileSync("platforms/ios/" + name + "/Resources/Resources/GoogleService-Info.plist", contents)
                fs.writeFileSync("GoogleService-Info.plist", contents);
                fs.writeFileSync("platforms/ios/www/GoogleService-Info.plist", contents);
              } catch(err) {
                process.stdout.write(err);
              }

              break;
            }
          }
        }

        if (self.directoryExists("platforms/android")) {
          var paths = ["src/projects/firebase/"+env+"/google-services.json"];

          for (var i = 0; i < paths.length; i++) {
            if (self.fileExists(paths[i])) {
              try {
                var contents = fs.readFileSync(paths[i]).toString();
                fs.writeFileSync("google-services.json", contents);
                fs.writeFileSync("platforms/android/assets/www/google-services.json", contents);
                fs.writeFileSync("platforms/android/google-services.json", contents);

                var json = JSON.parse(contents);
                var strings = fs.readFileSync("platforms/android/res/values/strings.xml").toString();

                // strip non-default value
                strings = strings.replace(new RegExp('<string name="google_app_id">([^\@<]+?)<\/string>', "i"), '')

                // strip non-default value
                strings = strings.replace(new RegExp('<string name="google_api_key">([^\@<]+?)<\/string>', "i"), '')

                // strip empty lines
                strings = strings.replace(new RegExp('(\r\n|\n|\r)[ \t]*(\r\n|\n|\r)', "gm"), '$1')

                // replace the default value
                strings = strings.replace(new RegExp('<string name="google_app_id">([^<]+?)<\/string>', "i"), '<string name="google_app_id">' + json.client[0].client_info.mobilesdk_app_id + '</string>')

                // replace the default value
                strings = strings.replace(new RegExp('<string name="google_api_key">([^<]+?)<\/string>', "i"), '<string name="google_api_key">' + json.client[0].api_key[0].current_key + '</string>')

                fs.writeFileSync("platforms/android/res/values/strings.xml", strings);
              } catch(err) {
                process.stdout.write(err);
              }

              break;
            }
          }
        }
          setTimeout(()=>{resolve(true); console.log("Write firebase "+env)},500);
      });
    };

    return {
      apply: self.apply
    }
};

  module.exports = firebase;
