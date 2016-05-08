# Pentacall
Its Peer to Peer One-Click voip  Service for League of Legends
[todo: More Buzzwords?]
# Why Pentacall?
So in League of Legends, as it is in every team oriented game, communication is king. 
So most of the time i would just play with my friends being in the same room, or having a voip call via Skype, Teamspeak... you name it. 

This way, we would truly have an advantage over all other players on the game field, because the pings are not as meaningfull ( an "Engage" ping would be great, by the way) and chat is dangerous to use in fights.

So sometimes, when not playing with my Friends, I'd love to have a talk with the mates but setting up a connection with all 5 of them is difficult to do during the cue, especially in normals. Agreeing on a service, copy pasting credentials, etc etc. It just doesn't work.

So i came to this Idea. 

## The One Click Voip Solution for League of Legends
Well, how does it work? Its one click, you open Pentacall.me, enter your username and region, press connect and switch back to LoL. (You got me, its 3 clicks.) 

The website's backend uses the Riot API to search for active games and tries to connect you automatically with your team-mates, they just need to have Pentacall.me opened and be logged in aswell. 

The clear advantage is, setting up a teamcall is now as easy as dropping a one-liner in the chat. No software or credentials required other then **Google Chrome**.

Well and if more and more people are using Pentacall.me it doenst even need a one-liner anymore, it all just happens magically!

# Cool? Well the one thing...
This Software was coded in 2 weeks. So it's pretty Beta. Expect some unexpected stuff to happen while you Test it out. 

For the moment the only Browser that is **enabled is Google Chrome**, Firefox will work soon, there is just some tiny Bugs that does hold it back. Edge is unsupported, because it doesn't support WebRTC.

## Installation and Testing
So interested to Test it? Great. Just hop over to Pentacall.me.

You want to run the server yourself? Well ok. Just clone the repo and run
```sh
$ npm install
```

then copy rename the "example-config.json" to "config.json" and edit the configuration as you need. 
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
The SSL Key and Cert is required as access to the UserMedia requires a "secure orgrin". Start the Server with: 
```
node server.js
``` 
and Connect to the sslPort in your Browser. The normal port was needed in case you have an Apache that runs as HTTPS Proxy. 


have a nice day
Sebastian& Antoni


