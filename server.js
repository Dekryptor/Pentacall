/*
RIFT CALLING SYSTEM


MIT License
Sebastian Streich
*/


var express = require("express");
var fs = require("fs")
var peerProvider = require('peer').ExpressPeerServer;
var callBroker = require("./lib/SocketHandler.js")

var app = express();

//Try to Read the Secret Config File
var config = JSON.parse(fs.readFileSync("config.json",{encoding:"utf-8"}));



// Lets Initialise the static HTTP Server, pretty boring
app.use(express.static('www'));
var server = app.listen(config.port);

 /*
 In this APP Peer.js only Handles Interconnecting the VOIP Clients, 
 the Controllflow is completely Handled by a Websocket.
 */
    //Lets listen the PeerJS Broker on /voip
    app.use("/voip",peerProvider(server,{debug:true}));

    //Initialise the socket IO Instance 
    var io      = require("socket.io")(server);
    io.on("connection",function(socket) {
        callBroker.handle(socket);
    });