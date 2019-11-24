// RANDOM LINES BOT VERSION 2.0

/*
Known Bugs:
- N/A
*/

// Module Loading
const tmi = require("tmi.js"); // Main Twitch Endpoint
var fs = require('fs'); // Reading data for lines.json
var request = require('request'); // API calls
var moment = require('moment'); // Time since formatting
var userInfo = require("./info.json");
//
// User editable settings
var mUsername = userInfo.info[0].mUsername;
var mPassword = userInfo.info[0].mPassword;
var mChannel = userInfo.info[0].mChannel;
var debugMode = userInfo.info[0].debugMode;
var cooldownSecs = userInfo.info[0].cooldown;
var bannedWords = new Array(userInfo.info[0].bannedWords);

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
if (debugMode == true) { console.log(mUsername, mPassword, mChannel, debugMode); }

// General Functions
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
async function getBannable(message) {
  if (bannedWords.some(function(v) { return message.indexOf(v) >= 0; })) { return bannable = true; } else { return bannable = false; }
}

// global variables
cooldownRQ = new Date();
cooldownRL = new Date();

client.connect();
client.on("chat", function(channel, userstate, message, self) {

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
          if (err) throw err;
          if (options.options.debug === true) { console.log('Message recorded!'); }
        });
      });
    } catch (error) { console.log(error); }

    setTimeout(function() {
      if (cmdSplit[0] === `!randomline` || cmdSplit[0] === `!rl`) { // gets a random message from person who ran command
        if (((new Date().getTime() - new Date(cooldownRL).getTime()) / 1000) > cooldownSecs) {
          try {
            fs.readFile('./lines.json', (err, data) => {
              if (err) throw err;
              let linesDB = JSON.parse(data);
              if (typeof cmdSplit[1] === 'undefined' || cmdSplit[1].length < 3) {
                var pos = linesDB.messages.map(function(e) {  return e.username; }).indexOf(userstate.username, Math.floor(Math.random()*linesDB.messages.length));
                var messageRandom1 = linesDB.messages[pos];
                if (options.options.debug === true) { console.log(messageRandom1); }
                var messageCheck = `${messageRandom1.message} ${messageRandom1.username}`;
                getBannable(messageCheck).then(function(bannable) {
                  if (bannable == false) {
                    var messageRandom2 = `[Random Line] ${messageRandom1.username} (${moment(messageRandom1.date).fromNow()}): ${messageRandom1.message}`;
                    client.action(channel, messageRandom2);
                  }
                  else {
                    var messageRandom2 = `[Random Line] ** BANNED PHRASE DETECTED ** `;
                    client.action(channel, messageRandom2);
                  }
                }).catch(function(error) { console.log(error); client.action(channel, `Error while ban-phrase checking`) });
              }
              else if (cmdSplit[1].length < 3) {
                var pos = linesDB.messages.map(function(e) { return e.username; }).indexOf(cmdSplit[1], Math.floor(Math.random()*linesDB.messages.length));
                if (pos < 0) {
                  if (cmdSplit[1].length < 3) { client.action(channel, `[Random Line] Could not find any messages for specified user.`); }
                  else { client.action(channel, `[Random Line] Could not find any messages for ${cmdSplit[1]}`); }
                } else {
                  var messageRandom1 = linesDB.messages[pos];
                  if (options.options.debug === true) { console.log(messageRandom1); }
                  var messageCheck = `${messageRandom1.message} ${messageRandom1.username}`;
                  getBannable(messageCheck).then(function(bannable) {
                    if (bannable == false) {
                      var messageRandom2 = `[Random Line] ${messageRandom1.username} (${moment(messageRandom1.date).fromNow()}): ${messageRandom1.message}`;
                      client.action(channel, messageRandom2);
                    }
                    else {
                      var messageRandom2 = `[Random Line] ** BANNED PHRASE DETECTED ** `;
                      client.action(channel, messageRandom2);
                    }
                  }).catch(function(error) { console.log(error); client.action(channel, `Error while ban-phrase checking`) });
                }
              }
            });
          } catch (error) {
            console.log(error);
          }
          cooldownRL = new Date();
        }
      }

      if (cmdSplit[0] === `!randomquote` || cmdSplit[0] === `!rq`) { // gets random message from anyone in chat
        if (((new Date().getTime() - new Date(cooldownRQ).getTime()) / 1000) > cooldownSecs) {
          try {
            fs.readFile('./lines.json', (err, data) => {
              if (err) throw err;
              let linesDB = JSON.parse(data);
              var messageRandom1 = linesDB.messages[Math.floor(Math.random()*linesDB.messages.length)];
              var messageCheck = `${messageRandom1.message} ${messageRandom1.username}`;
              getBannable(messageCheck).then(function(bannable) {
                if (bannable == false) {
                  var messageRandom2 = `[Random Quote] ${messageRandom1.username} (${moment(messageRandom1.date).fromNow()}): ${messageRandom1.message}`;
                  client.action(channel, messageRandom2);
                }
                else {
                  var messageRandom2 = `[Random Quote] ** BANNED PHRASE DETECTED ** `;
                  client.action(channel, messageRandom2);
                }
              }).catch(function(error) { console.log(error); client.action(channel, `Error while ban-phrase checking`) });
            });
          } catch (error) {
            console.log(error);
          }
          cooldownRQ = new Date();
        }
      }
    }, 50);

});
