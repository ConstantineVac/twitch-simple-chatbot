const tmi = require('tmi.js');

// Define your bot's configuration
const config = {
  identity: {
    username: 'ConstantinesVac',
    password: 'oauth:cmphzp7a660v649w9xxtu9z8qs1f24', // Replace with your OAuth token
  },
  channels: ['ConstantineVac98'], // Replace with the channel you want the bot to join
};

// Create a Twitch client
const client = new tmi.client(config);

// Register event handlers
client.on('connected', (address, port) => {
  console.log(`Connected to ${address}:${port}`);
});

client.on('chat', (channel, user, message, self) => {
  // Your bot's chat command handling logic goes here
  if (message === '!hello') {
    client.say(channel, `Hello, ${user.username}!`);
  }
});

// Connect to Twitch
client.connect();
