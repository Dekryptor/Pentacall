var d;
var s;
window.addEventListener("load",function() {
    console.log("READY");
    var socket = io();
    var peer = new Peer(null,{host:"localhost",port:"3000",path:"/voip",debug:3});
    //TODO: DEBUG STUFF, PLZ REMOVE if done
        s = socket;
        d= peer;
    
    document.querySelector("paper-button").addEventListener("click",function(e) {
        //Enter Button Clicked, so lets handle
        var server = document.querySelectorAll("#loginForm paper-input")[0].value.toLowerCase();
        var name = document.querySelectorAll("#loginForm paper-input")[1].value;
        
        var registerBlob={server:server,summonerName:name,callID:d.id};
        socket.emit("register",registerBlob,onRegisterResponse);
    });
    
    function onRegisterResponse(ack,msg){
           //We got an Answer to the Register Try. 
            if(ack){
                //We got in.
                console.log("Gotcha");
                var user = msg;
                
                //Lets Prepare the UI:
                var controller = document.querySelector("user-card");
                controller.name=user.name;
                controller.level=user.summonerLevel;
                controller.icon=user.profileIconId;
                              
                document.querySelector("#stateRouter").selected=1; // Switch to the other State
            }
            else{
                //Nope -> Some Error here.
                console.log("Fehler -> Reason:" +msg );
            }
       }; 
    
    socket.on("mateFound",function(data) {
        //We got another Member so, lets call Him
        console.log(data);
    });
    
    
});