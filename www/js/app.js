var d;
var s;
window.addEventListener("load",function() {
    var socket = io();
    var peer = new Peer(null, {host: "localhost", port: "3000", path: "/voip", debug: 3});
    var toast = document.querySelector("paper-toast");
    var mediaStream;

    var pages = document.querySelector("iron-pages");

    async.waterfall([
        function (doneCallback) {
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
                    pages.selected++;
                    doneCallback(null);
                }
            });



        },
        function (doneCallback) {
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
                var registerBlob = {server: server, summonerName: name, callID: peer.id};
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
                    doneCallback(null,msg);
                }
                else {
                    validationError(msg);
                }
            }

            connectButton.addEventListener("click", buttonClick);

        },

        function (User) {
            //Stage 2:




        }

    ]);

    //Enable Protocoll Awareness:

    socket.on("mateFound",function () {

    });





});



