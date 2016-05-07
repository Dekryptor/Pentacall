var request = require('request')
var fs =require("fs");


var config= JSON.parse(fs.readFileSync("config.json",{encoding:"utf-8"}));
var key = config.riotAPIKey;
const maxCalls= config.apiLimit;
var leftCalls= maxCalls;
exports.setKey= function(newKey){key=newKey;};


exports.getUserByName= function(name,server,callback){
    if(leftCalls<=0){
        console.log("[INFO] Run Out of API Keys, getUserByName has been delayed");
        setTimeout(exports.getUserByName,20000,name,server,callback);
        return;
    }
    leftCalls--;
    //Gets the User on the Specified Server. takes an f(err,user) as callback
    request("https://"+server+".api.pvp.net/api/lol/"+server+"/v1.4/summoner/by-name/"+name+"?api_key="+key,function(error,response,body) {
        if(error){ callback(error,null);return;}
        if(response.statusCode==404){ callback("User not found",null);return;}
        if(response.statusCode==403){ callback("Internal Server Error, sorry",null);return;}



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

exports.getTeam= function(ID,server,callback){
    if(leftCalls<=0){
        console.log("[INFO] Run Out of API Keys, getTeam has been delayed");
        setTimeout(exports.getTeam,20000,ID,server,callback);
        return;
    }
    leftCalls--;


    //Lets generate the Plattform ID:
    var plattformID;

    switch (server){
        case "eune":
            plattformID="EUN1";
            break;
        case "kr":
            plattformID="KR";
            break;
        case "oce":
            plattformID="OC1";
            break;
        case "lan":
            plattformID="LA1";
            break;
        case "las":
            plattformID="LA2";
            break;
        case "ru":
            plattformID="RU";
            break;
        default:
            plattformID=server.toUpperCase() + "1";
            break;
    }
    request("https://"+server+".api.pvp.net/observer-mode/rest/consumer/getSpectatorGameInfo/"+plattformID+"/"+ID+"?api_key="+key,function (err,res,body) {
        //Errorhandling
        if(res.statusCode==404){callback("no game found",null); return;}
        if(res.statusCode==429){callback("Rate Limit Exceeded",null);leftCalls=0; return;}
        if(res.statusCode==403){callback("Forbidden",null);return;}
        if(err){callback(err,null);return;}

        //So no errors here.
        var game = JSON.parse(body);

        try{
            var Player = game.participants.filter(function (e,i,a) {
                return (e.summonerId == ID);
            });


            var  teamMates= game.participants.filter(function (element,index,arr) {
                return element.teamId == Player[0].teamId;
            });
            addChampionData(teamMates);
            callback(null,teamMates);
        }
        catch (e){
            console.log(e);
            console.log("[INFO] Run Out of API Keys, getTeam has been delayed");
            setTimeout(exports.getTeam,20000,ID,server,callback);

        }


    });
};




//InitPhase, lets fetch a Fresh Copy of all Champions
var cachedChampions;
var championNames=[];
request("https://global.api.pvp.net/api/lol/static-data/euw/v1.2/champion?api_key="+key,function (err,res,b) {
   if(!err && res.statusCode==200){
       var c = JSON.parse(b);
       cachedChampions= c.data;
       console.log("[INFO] Sucsessfully Cached Champion Data");
       championNames= Object.keys(cachedChampions);
   }
});

function addChampionData(team) {
  team.forEach(function (e,i,a) {
    e.champion = resolveChampionId(e.championId);
  });

}


function resolveChampionId(championId) {
    for(var i=0; i< championNames.length;i++){
        if(cachedChampions[championNames[i]].id == championId){
            return championNames[i];
        }
    }
    return "Not Found";
}



// Reset Left API Calls
setInterval(function () {
    //Call Every 10 Minutes
    console.log("[INFO] Renewed API KEYS");
    leftCalls=maxCalls;
},10*60*1000);