console.log("Please do not have the Developer tools opened while loading");
console.log("This breaks stuff on Firefox and i have no clue why...");

var d;
var s;
window.addEventListener("load",function() {
    console.log(configuration);
    var socket = io(configuration.hostname+":"+configuration.port);
    var peer = new Peer(null, {host: configuration.hostname,"port":configuration.port, path: "/voip", debug: 3});
    var toast = document.querySelector("paper-toast");
    var mediaStream;

    var pages = document.querySelector("iron-pages");
    var infoCard = document.querySelector("info-card");
    try { infoCard.bindToSocket(socket);}
    catch (e){}
    var ownUserData;
    var registerBlob;



    async.waterfall([
        function (bootDone) {
            //Stage 0: Check and Bootup
            var root    = document.querySelector("#boot");
            var heading = root.querySelector("h1");
            var text    = root.querySelector("p");
            var btn     = root.querySelector("paper-button");
            var logo    = root.querySelector("img");
            
            function show(e) {e.setAttribute("class","");}

            async.waterfall([
                //Into and show everything
                function (callback) {
                    //Phase 1, show the logo and
                    logo.setAttribute("class","animated  zoomIn");
                    setTimeout(function () {
                        callback(null);
                    },1000);
                },
                function (callback) {
                    //Check if the Browser Supports Calling.
                    if(util.supports.audioVideo){callback(null)}
                    else{callback({heading:"We're really Sorry",text:"But it seems Like your Browser doesnt Support WebRTC, which is required."})}
                },
                function (callback) {
                    if(navigator.userAgent.includes("Firefox")||navigator.userAgent.includes("Opera")){
                        callback({heading:"Sorry for beeing in beta",text:"But at this Moment we're just not Ready for Firefox or Opera, please use Chrome :( ."})
                    }
                    else{callback(null);}
                },
                function (callback) {
                    //Then Lets Get a Media Stream.

                    navigator.getUserMedia  = navigator.getUserMedia ||
                        navigator.webkitGetUserMedia ||
                        navigator.mozGetUserMedia ||
                        navigator.msGetUserMedia;

                    navigator.getUserMedia({audio: true},function (stream) {
                        mediaStream=stream;
                        callback(null)
                    },function () {
                        callback({heading:"Its silent here.",text:"To enable Calling, we need ascess to your Microphone. Please change your Settings and reload the Page."})
                    });

                },
                function (callback) {
                    //Last Check. Lets see if The Sockets are up.
                    if(socket.connected && peer.id != null){
                        callback(null);
                    }
                    else{
                        callback({heading:"Ooops. Something went wrong.",text:"We couldn't establish a Connection to the Server, we're really sorry."})
                    }


                }
                
            ],function(err,res){
                //Here Happened Some Error, so Lets print it.
                if(err){
                    heading.innerText=err.heading;
                    text.innerText=err.text;
                    show(heading);
                    show(text);
                }else{
                    //No Errors, so we're good to go! <3
                    console.log("All checks done. We're ready to rumble.");
                    bootDone(null);
                }
            });



        },
        function (loginDone) {
            pages.selected++; // Go the Login Page
            //Stage 1 Login:
            var root = document.querySelector("#loginState");

            //Get the Old Stage, if exists.
            var name = localStorage.getItem("summonerName") || "";
            var region = localStorage.getItem("region") || 0;

            var serverField = root.querySelectorAll("paper-input")[0];
            var nameField = root.querySelectorAll("paper-input")[1];
            var connectButton = root.querySelector("paper-button")
            //Restore.
            serverField.selected = region;
            nameField.value = name;


            function buttonClick(){
                //Get the Values
                name = nameField.value;
                if(name.length<4){validationError("Name too short");return;}
                var server = serverField.value.toLowerCase();
                registerBlob = {server: server, summonerName: name, callID: peer.id};
                socket.emit("register", registerBlob, onRegisterResponse);
            }

            function validationError(msg) {
                toast.text=msg;
                toast.open();
                //Let the Form Shake for some Time
                root.querySelector("div").setAttribute("class", "animated shake infinite");
                window.setTimeout(function () {
                    root.querySelector("div").setAttribute("class", "");
                }, 500);
            }

            function onRegisterResponse(sucsess, msg) {
                if (sucsess) {
                    localStorage.setItem("summonerName",name);
                    localStorage.setItem("region",serverField.selected);
                    connectButton.removeEventListener("click",buttonClick);
                    loginDone(null,msg);
                }
                else {
                    validationError(msg);
                }
            }

            connectButton.addEventListener("click", buttonClick);

        },

        function (User,CallEnded) {
            //Stage 2: User Has Logged in
            pages.selected++; //Go to the User Page
            var root = document.querySelector("#CallView .stuffholder");
            var UserCard = document.createElement("user-card");
            ownUserData= User;
            UserCard.name = User.name;
            UserCard.level = User.summonerLevel;
            UserCard.icon = User.profileIconId;

            // Object {id: 81385112, name: "annFishman", profileIconId: 10, summonerLevel: 30, revisionDate: 1462124849000}

            root.innerHTML="";
            UserCard.setAttribute("class","animated zoomIn");
            root.appendChild(UserCard);

            UserCard.addEventListener("close",function () {
                var mates = document.querySelectorAll("mate-card");
                for(var i=0; i< mates.length; i++){
                    mates[i].endCall(peer);

                }
                function onRegisterResponse(sucsess, msg) {
                    if (sucsess) {
                        toast.text="Searching for the Next Game";
                        toast.open();
                    }
                    else {
                        toast.text=msg;
                        toast.open();

                    }
                }

                //All Calles Ended so lets Put us back in the Waiting Que.
                socket.emit("register", registerBlob,onRegisterResponse);

            });


        }

    ]);

    //Enable Protocoll Awareness:

    peer.on('call',  function(call) {
        //We've been Called
        console.log("[Info] Sombody has called us");

        if(peer.connections[call.peer].length==1){
            call.answer(null);
            peer.call(call.peer,mediaStream,{metadata:ownUserData});

        }else{
            call.answer(null);
        }
        var root = document.querySelector("#CallView .stuffholder");
        var mateCard = document.createElement("mate-card");
        mateCard.bindToCall(call,registerBlob.server);
        root.appendChild(mateCard);




       
    });

    socket.on("mateFound",function (mateArray) {
        //We got an Array of Teammates, so Well. Lets add them to The Canvas.
        if(ownUserData==undefined) return;
        //We're logged in.

        mateArray.forEach(function (e,i,a) {
            if(e.callID == peer.id){
                //Thats us!
                ownUserData.inGame = e;
                document.querySelector("user-card").setChampPic(e.champion);
                document.querySelector("user-card").setMastery(registerBlob.server,e.summonerId,e.championId);

                return;
            }
            if(peer.connections[e.callID]!=null){
                
            }else{
                console.log("[Info] Going to Call somebody");
                peer.call(e.callID, mediaStream,{metadata:ownUserData});
            }


        });

    });









});



