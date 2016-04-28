/**
 * Created by Basti on 28.04.2016.
 * This Module is a searcher, Recieving SummonerID's and watching out
 * if they do have games.
 * It fetches then the Team adds champion Information and then Pushes it back to the main Thread.
 */


var api =require('./riotAPI');

const limit = 500; // 500 Messages in
const period= 5*60; // 5 Minutes.
const delay = Math.round(limit/period); // delay between searches.

var count =0;
var searchTargets =[];

function search() {
    // Do The Search here.
    var i=count;
    try{
        var user=searchTargets[i];
        api.getTeam(user.id,user.server,function (err,team) {
            if(err){return;}

            user.callback(null,team);
            searchTargets.splice(i,1);
            console.log("[SEARCH WORKER] Found a Team");

        });
    }
    catch (e){

    }
    if(searchTargets.length!=0){
        count = (count+1) % searchTargets.length;
    }
}
setInterval(search,delay*2000);

console.log("[SEARCH WORKER] Started");

exports.push= function (id,server,callback) {
      searchTargets.push({id:id,server:server,callback:callback});
      console.log("[SEARCH WORKER] Added an Entry");
};




