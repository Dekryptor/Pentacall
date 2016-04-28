var request = require('request')
var fs =require("fs");

var key = JSON.parse(fs.readFileSync("config.json",{encoding:"utf-8"})).riotAPIKey;



exports.getUserByName= function(name,server,callback){
    //Gets the User on the Specified Server. takes an f(err,user) as callback
    request("https://"+server+".api.pvp.net/api/lol/"+server+"/v1.4/summoner/by-name/"+name+"?api_key="+key,function(error,response,body) {
       if(!error && response.statusCode ==200){
           try{
               var Userlist = JSON.parse(body);
               var index = Object.keys(Userlist)[0];
               var retrievedUser = Userlist[index];
               callback(null,retrievedUser);
           }catch(e){
               callback(e,null); // Malformed JSON
           }
       }else{
           callback(response.statusCode,null); //Not Found or Limit exeeded
       }
    });
};

