// RANDOM LINES BOT VERSION 1.0 BETA

/* 
Known Bugs:
- lines.json resets on unexpected errors
*/

// Module Loading
const tmi = require("tmi.js"); // Main Twitch Endpoint
var fs = require('fs'); // Reading data for lines.json
var request = require('request'); // API calls
var moment = require('moment'); // Time since formatting

/// EDIT THIS INFORMATION BELOW VVV
var mUsername = `USERNAME_HERE`; // <- Enter the bot's username
var mPassword = `oauth:ENTER_HERE`; // <- Enter the bot's oAuth code
var mChannel = `ENTER_CHANNEL_NAME`; // <- Enter channel name (only add your own channel or a channel where you have broadcaster permission!)
var debugMode = false; // <- Change to true for console logging on whenever the lines.json file changes (Can get spammy!)
///

// Only change information below if you know what you're doing!


let options = {
    options: {
        debug: debugMode
    },
    connection: {
        reconnect: true,
        secure: true
    },
    identity: {
        username: mUsername,
        password: mPassword
    },
    channels: [mChannel]
};
let client = new tmi.client(options);
client.on('connected', onConnectedHandler);
function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body);
    }
}
request(options, callback);
function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
}


// General Functions
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

client.connect();
client.on("chat", function(channel, userstate, message, self) {
    if (self) { return; }

    const commandName = message.trim(); var cmdSplit = commandName.split(' ');

    if ((cmdSplit[0] === `@debug`) && userstate.mod === true) {

        if (cmdSplit[1] === `eval`) {
          try {
          var exfun = `${commandName.substring(12)}`;
          console.log(exfun);
          var output1 = eval(exfun).toString();
          client.say(channel, output1);
          console.log(eval(exfun));
          } catch(error) { console.log(error); }
          return;
        }
  
    }

    try {
      fs.readFile('./lines.json', (err, data) => {
        if (err) throw err;
        let linesDB = JSON.parse(data);
        linesDB.messages.push({
          username: `${userstate.username}`,
          date: `${new Date()}`,
          message: `${commandName}`
        });
        fs.writeFile('./lines.json', JSON.stringify(linesDB, null, 2), 'utf-8', function(err) {
          if (err) throw err
          if (options.options.debug === true) { console.log('Message recorded!'); }
        })
      });
    } catch (error) {
      console.log(error);
    }

    if (cmdSplit[0] === `!randomline` || cmdSplit[0] === `!rl`) {
      try {
        fs.readFile('./lines.json', (err, data) => {
          if (err) throw err;
          let linesDB = JSON.parse(data);
          if (typeof cmdSplit[1] === 'undefined') {
            var pos = linesDB.messages.map(function(e) {  return e.username; }).indexOf(userstate.username, Math.floor(Math.random()*linesDB.messages.length));
            var messageRandom1 = linesDB.messages[pos];
            if (options.options.debug === true) { console.log(messageRandom1); }
            var messageRandom2 = `[Random Line] ${messageRandom1.username} (${moment(messageRandom1.date).fromNow()}): ${messageRandom1.message}`;
            client.action(channel, messageRandom2);
          }
          else if (cmdSplit[1].length >= 2) {
            var pos = linesDB.messages.map(function(e) {  return e.username; }).indexOf(cmdSplit[1], Math.floor(Math.random()*linesDB.messages.length));
            var messageRandom1 = linesDB.messages[pos];
            if (options.options.debug === true) { console.log(messageRandom1); }
            var messageRandom2 = `[Random Line] From ${messageRandom1.username} (${moment(messageRandom1.date).fromNow()}): ${messageRandom1.message}`;
            client.action(channel, messageRandom2);
          }
        });
      } catch (error) {
        console.log(error);
      }
    }

    if (cmdSplit[0] === `!randomquote` || cmdSplit[0] === `!rq`) {
      try {
        fs.readFile('./lines.json', (err, data) => {
          if (err) throw err;
          let linesDB = JSON.parse(data);
          var messageRandom1 = linesDB.messages[Math.floor(Math.random()*linesDB.messages.length)];
          var messageRandom2 = `[Random Quote] From ${messageRandom1.username} (${moment(messageRandom1.date).fromNow()}): ${messageRandom1.message}`;
          client.action(channel, messageRandom2);
        });
      } catch (error) {
        console.log(error);
      }
    }

});
