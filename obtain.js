const fs = require('fs'); // Import the 'fs' module for file operations

const songFilePath = './song.txt'; // Specify the path to your text file

const tmi = require('tmi.js');

const client = new tmi.Client({
    connection: {
        reconnect: true
    },
    channels: ['constantinevac98'],
    identity: {
        username: 'BeepBoop98',
        password: 'oauth:ol0bu5fcs63glcq637g0xkhlwy0f3q'
    }
});


client.connect();

client.on('chat', (channel, user, message, self) => {
    // Your bot's chat command handling logic goes here
    if (message === '!hello') {
      client.say(channel, `Hello, ${user.username}!`);
    }
});

client.on('chat', (channel, user, message, self) => {
    if (message === '!song') {
      // Read the content of the text file
      fs.readFile(songFilePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading the song file:', err);
          client.say(channel, 'Sorry, there was an error reading the song file. 🥺');
          return;
        }
  
        // Split the file content into lines
        const lines = data.split('\n').map((line) => line.trim());
  
        // Check if there are at least two lines of content (name and album)
        if (lines.length >= 2) {
          const name = lines[0];
          const album = lines[2]; // Adjust the index to skip the empty line
          client.say(channel, `🎶Currently Playing: ${name},\n💿Album: ${album}!`);
        } else {
          client.say(channel, 'Sorry, the song information is incomplete in the file.🥺');
        }
      });
    }
  });

  
  
// client.on('message', (channel, tags, message, self) => {
//     console.log(`${tags['display-name']} : ${message}`);
// });

