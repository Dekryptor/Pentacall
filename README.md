# Pentacall
Its Peer to Peer One-Click voip  Service for League of Legends
[todo: More Buzzwords?]
# Why Pentacall?
So in League of Legends, as it is in every Team oriented Game, Communication is King. 
So most of the Time i would just play with my Friends beeing in the same Room, or having a Voip Call via Skype, Teamspeak... you name it. 

This way, we would truly have an advantage over all other Players on the Gamefield, because the Pings are not as Meaningfull ( an "Engage" ping would be great, by the way) and Chat is Dangerous to use in Fights.

So sometimes when not Playing with my Friends i'd love to have a Talk with the Mates but Setting up a Connection with all 5 of them is Difficult to do during the Cue, especially in Normals. Agreeing on a Service, copy pasting credentials etc etc. It just Doesnt Work.

So i came to this Idea. 

## The One Click Voip Solution for League of Legends
Well, how does it work? Well its one Click, you open Pentacall.me, enter your Username and Server, press Connect and switch back to LoL. (You got me, its 3 clicks.) 

The Website-Backend uses the Riot API to search for Active Games and tries to connect you automatically with your Team-mates, they just need to have Pentacall.me opened and be logged in aswell. 

The clear advantage is, setting up a Teamcall is now as easy as dropping a one-liner in the chat. No Software or Credentials required.

Well and if more and more People are using Pentacall.me it doenst even need a one-line, it all just happens magically!

# Cool? Well the one thing...
This Software was coded in 2 Weeks. So it's pretty Beta. Expect some unexpected stuff to happen while you Test out. 

For the moment the only Browser that is **enabled is Google Chrome**, Firefox will work soon, there is just some tiny Bugs that does hold it back. Edge is unsupported, because it doesn't support WebRTC.

## Installation and Testing
So interested to Test it? Great. Just hop over to Pentacall.me.

You want to run the Server yourself? Well ok. Just clone the Repo and run
```sh
$ npm install
```

then Copy rename the "example-config.json" to "config.json" and edit the Configuration as you need. 
``` json 
"Example Configuration"
{
    "riotAPIKey":"XXXXXXX-XXXX-XXXX-XXXX-XXXXXXX",
    "apiLimit":400, 
    "hostname":"pentacall.me",
    "port":8080,
    "sslPort":80,
    "sslKey": "privkey.pem",
    "sslCert": "cert.pem"
}
``` 
The SSL Key and Cert is required as acsess to the UserMedia requires a "secure orgrin". Start the Server with 
```
node server.js
``` 
and Connect to the sslPort in your Browser. The normal Port was needed in case you have an Apache that runs as HTTPS Proxy. 


