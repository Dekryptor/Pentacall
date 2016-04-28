/*
SocketHandler.js

This Module gets a Socket, let it register and Pass those Information for call making

*/
var http = require('http');
var api = require('./riotAPI.js');
var async = require('async');
var teamWatcher = require("./teamWatcher");
var registeredUsers= [];




exports.handle= function(socket) {
    //Registers the Socket with all the Nessecary Eventhandlers    
    socket.on("register",registerSocket);
    socket.on("disconnect",unregisterSocket);

};



function registerSocket(params,ack) {
    // Params : {server:server,summonerName:"summonerName",number:"the Call Number"}   
    //Lets Check if there are some Sockets connected with that Username
    var newSocket=this;

    var duplicates = registeredUsers.filter(function(val) {return (val.summonerName == params.summonerName)});
    if(duplicates.length!=0){ack(false,"Some other is Connected"); return;}

    //Not a dublicate so lets find out more
    
    async.waterfall([
        function (callback) {
            //Step 1, find out the User
            api.getUserByName(params.summonerName,params.server,callback);
        },
        function (User,callback) {
            //Step 2, Push the User into the Registered Users Array
            registeredUsers.push({
                summonerName: params.summonerName,
                callID: params.callID,
                ioSocket:newSocket,
                server:params.server,
                userData:User
            });
            console.log(User);
            ack(true,User); // Tell the Client the Registration was Sucsessfull
            callback(null,User,params.server);
        },
        function (User,Server,Callback) {
            //Step 3: Register the Client at the Search Service
            teamWatcher.push(User.id,Server,Callback);
        },
        function (Team,Callback) {
            //Step 4: We Got a Team! Check the List to See if we can Get any Call'ids
            console.log("We got a Team FOR X");
            //Todo: This.

            Callback(null);
        },
        function (callback) {
            //Step 5: We got a Team and some ID's, great. so Lets push them to the Client:
            newSocket.emit("newMates", "TESTING");

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
    registeredUsers.forEach(function(val,index,arr) {
        if(target.id== val.ioSocket.id){
            //Found the Entry
           registeredUsers.splice(index,1);
        }
    });
    

}

