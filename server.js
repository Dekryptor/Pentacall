/*
RIFT CALLING SYSTEM


MIT License
Sebastian Streich
*/


var express = require("express");
var fs = require("fs")
var peerProvider = require('peer').ExpressPeerServer;
var callBroker = require("./lib/SocketHandler.js")
var https = require('https');


var app = express();

//Try to Read the Secret Config File
var config = JSON.parse(fs.readFileSync("config.json",{encoding:"utf-8"}));

//Get the Certificates for the Websockets
var privateKey = fs.readFileSync( config.sslKey );
var certificate = fs.readFileSync( config.sslCert );


// Lets Initialise the static HTTP Server, pretty boring
app.use(express.static('www'));
var server = app.listen(config.port);

var httpsServer = https.createServer({key: privateKey, cert: certificate},app).listen(config.sslPort);


 /*
 In this APP Peer.js only Handles Interconnecting the VOIP Clients, 
 the Controllflow is completely Handled by a Websocket.
 */
    //Lets listen the PeerJS Broker on /voip
    app.use("/voip",peerProvider(httpsServer,{debug:true}));

    //Initialise the socket IO Instance 
    var io      = require("socket.io")(httpsServer);
    io.on("connection",function(socket) {
        callBroker.handle(socket);
    });



    //Make the Config Info Available for the Client
    app.get("/api/config",function (req,res) {
       var configObject= {
           "hostname":config.hostname,
           "port":config.sslPort
       };
        res.send("var configuration = JSON.parse('"+ JSON.stringify(configObject)+"');")
    });