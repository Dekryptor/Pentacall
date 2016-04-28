/*
Callbroker.js

This Module gets a Socket, let it register and Pass those Information for call making

*/
var http = require('http');
var api = require('./riotAPI.js');

var registeredUsers= [];


exports.register= function(socket) {
    //Registers the Socket with all the Nessecary Eventhandlers    
    socket.on("register",registerSocket);
    socket.on("disconnect",unregisterSocket);
    socket.on("any",anyMate);
}



function registerSocket(params,ack) {
    // Params : {server:server,summonerName:"summonerName",number:"the Call Number"}   
    //Lets Check if there are some Sockets connected with that Username
    var newSocket=this;
    
    var dubes = registeredUsers.filter(function(val,i,arr) {
        return (val.summonerName == params.summonerName)
    });
    
    if(dubes.length==0){
        //Not a dublicate so lets find out more
 
       api.getUserByName(params.summonerName,params.server,function(err,b) {
            // response is here
         registeredUsers.push({
            summonerName: params.summonerName,
            callID: params.callID,
            ioSocket:newSocket,
            server:params.server,
            userData:JSON.parse(b)
        });
        console.log(b);
        ack(true,b);  //Tell the Client everything ok.
       });     
    }
    else{
        ack(false,"Some Other is Connected");
    }   
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

function onMateFound(mate,socket){
    socket.emit("mateFound",mate)
}

function anyMate() {
    //TODO: Remove this, as this event is only for Testing
    // Gives the Client a Random Mate to call.
    
    var index = Math.round(Math.random()*registeredUsers.length)-1;
    var mate = registeredUsers[index];
    onMateFound({callID:mate.callID,userData:mate.userData},this);
}