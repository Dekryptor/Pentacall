/*
SocketHandler.js

This Module gets a Socket, let it register and Pass those Information for call making

*/
var http = require('http');
var api = require('./riotAPI.js');
var async = require('async');
var teamWatcher = require("./teamWatcher");

var registeredUsers= {};




exports.handle= function(socket) {
    //Registers the Socket with all the Nessecary Eventhandlers    
    socket.on("register",registerSocket);
    socket.on("disconnect",unregisterSocket);

};



function registerSocket(params,ack) {
    // Params : {server:server,summonerName:"summonerName",number:"the Call Number"}   
    //Lets Check if there are some Sockets connected with that Username
    var userSocket=this;
    var summonerName = params.summonerName;
    var server = params.server;
    var callID = params.callID;

    if(registeredUsers[summonerName]!=null){ack(false,"Some other is Connected"); return;}

    async.waterfall([
        function (callback) {
            //Step 1, find out the User
            api.getUserByName(summonerName,server,callback);
        },
        function (User,callback) {
            //Step 2, the User Exists, so lets Lock this.
            registeredUsers[summonerName]={callID:callID,Socket:userSocket};
            console.log(summonerName+" registered with :" + callID);
            ack(true,User); // Tell the Client the Registration was Sucsessfull
            callback(null,User,server);
        },
        function (User,Server,Callback) {
            //Step 3: Register the Client at the Search Service
            teamWatcher.push(User.id,Server,Callback);
        },
        function (Team,Callback) {
            //Step 4: We Got a Team! Check the List to See if we can Get any Call'ids
            console.log("We got a Team FOR " + summonerName);

            var callableTeammates=[];

            Team.forEach(function (TeamMate) {
                var sumName= TeamMate.summonerName;
                if(registeredUsers[sumName]!=null){
                    //He's registered.
                    TeamMate.callID= registeredUsers[sumName].callID;
                    callableTeammates.push(TeamMate);
                }
            });

            Callback(null,callableTeammates);
        },
        function (Mates,callback) {
            //Step 5: We got a Team and some ID's, great. so Lets push them to the Client:
            userSocket.emit("mateFound", Mates);
            callback(null);
        }
    ],function (err,res) {
        //Step 6: All done. Client got some Calls or not.
        //TODO: Clean Up their Registration.
    });
}


function unregisterSocket() {
   // Somebody has Closed the Website so lets Free the Username
   var target = this;


    var keys = Object.keys(registeredUsers);

    keys.forEach(function (e) {
       if(registeredUsers[e].Socket.id == target.id){
           delete  registeredUsers[e];
       }
    });



    

}

