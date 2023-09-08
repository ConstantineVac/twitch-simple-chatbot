const fs = require('fs');       // Import the 'fs' module for file operations
const os = require('os');

//const songFilePath = './song.txt'; // Specify the path to your text file  (Windows)

// const songFilePath = '/root/Documents/my_metadata.txt'; // Specify the path to your text file   (Linux Format)

// // Expand the tilde to the user's home directory
// const expandedFilePath = songFilePath.replace(/^~/, os.homedir());

// Load Package
const tmi = require('tmi.js');

const client = new tmi.Client({
    connection: {
        reconnect: true
    },
    channels: ['constantinevac98'],
    identity: {
        username: 'BeepBoop98',
        password: 'oauth:your_twitch_token',
    }
});


// Connect to Twitch
client.connect();

// Check The Bot status.
// Listen for the "connected" event to log that the bot is online
client.on('connected', (address, port) => {
    console.log(`✅Twitch Bot is Online. Address: ${address}, Port: ${port}`);
});

// Hello Command
client.on('chat', (channel, user, message, self) => {
    // Your bot's chat command handling logic goes here
    if (message === '!hello') {
      client.say(channel, `Hello, ${user.username}!`);
    }
});

// Social Command
client.on('chat', (channel, user, message, self) => {
    // Your bot's chat command handling logic goes here
    if (message === '!social') {
        const botUsername = 'ConstantineBot'; // Replace with your bot's username
        const socialLinks = [
            {
                platform: 'LinkTree',
                link: 'https://linktree.com/constantinevac',
            },
            {
                platform: 'YouTube',
                link: 'https://www.youtube.com/@ConstantineVac',
            },
            // Add more social platforms and links as needed
        ];

        // Send the messages one by one with line breaks
        socialLinks.forEach((linkData) => {
            const formattedMessage = `Hey @${user.username}, here is Constantine's ${linkData.platform} profile: ${linkData.link}`;
            client.say(channel, formattedMessage);
        });
    }
});


// Song Command
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

  
// Log Messages  
// client.on('message', (channel, tags, message, self) => {
//     console.log(`${tags['display-name']} : ${message}`);
// });

let pokemonList;
const gameState = {
    currentGameInProgress: false,
    currentPokemonName: null,
    currentClueIndex: 0,            // Initialize currentClueIndex to 0
};

//let userScores = {}; // Initialize an empty object to store user scores

// Read the user scores from a JSON file (e.g., 'userScores.json')
fs.readFile('./databank/userScores.json', 'utf8', (err, data) => {
    if (!err) {
        userScores = JSON.parse(data);
    }
});

// Read the JSON file and set up the game
fs.readFile('./databank/pokemonclues.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading JSON file:', err);
        return;
    }

    // Parse the JSON content
    const pokemonData = JSON.parse(data);

    // Access the Pokémon list
    pokemonList = pokemonData.pokemon;
    //console.log(pokemonList);
});

client.on('message', (channel, userstate, message, self) => {
    // Ignore messages from the bot itself
    if (self) return;

    // Start the game only if no game is currently in progress
    if (message.toLowerCase() === '!startgame' && !gameState.currentGameInProgress) {
        gameState.currentGameInProgress = true; // Set game state to "in progress"
        startGame(channel); // Pass the channel as an argument
    } else if (message.toLowerCase() === '!startgame' && gameState.currentGameInProgress) {
        // Inform the user that a game is already in progress
        client.say(channel, '⛔A game is already in progress. Please wait for it to finish.⛔');
        return;
    }

    // Check if the message is a guess and a game is in progress
    if (message.toLowerCase().startsWith('!guess') && gameState.currentPokemonName && gameState.currentGameInProgress) {
        // Extract the Pokémon name from the message
        const guess = message.toLowerCase().replace('!guess', '').trim();
        checkGuess(guess, channel, userstate, gameState); // Pass the channel as an argument
    } else if (message.toLowerCase().startsWith('!guess') && !gameState.currentGameInProgress) {
        // Inform the user that they can't guess because no game is in progress
        client.say(channel, 'There is currently no game in progress. Type !startgame to start a new game🕹️.');
    }
});


function startGame(channel) {
    // Reset game state
    gameState.currentPokemonName = getRandomPokemon().name;
    gameState.currentClueIndex = 0; // Initialize currentClueIndex to 0

    // Provide the first clue
    const initialClue = getClue(gameState.currentPokemonName, gameState.currentClueIndex);
    client.say(channel, `🕹️ Let's play Guess Who's the Pokémon! Here's your 🔍first clue: ${initialClue}`);
}


function getRandomPokemon() {
    const randomIndex = Math.floor(Math.random() * pokemonList.length);
    return pokemonList[randomIndex]; // Return the full Pokemon object
}

function getClue(pokemonName, currentIndex) {
    // Find the Pokémon in the list by name
    const foundPokemon = pokemonList.find((p) => p.name === pokemonName);
    console.log(foundPokemon)
    // console.log(currentIndex)
    // console.log(foundPokemon.clues)
    if (foundPokemon) {
        // Check if the current clue index is within the bounds of the clues array
        if (gameState.currentClueIndex >= 0 && gameState.currentClueIndex < foundPokemon.clues.length - 1) {
            return foundPokemon.clues[gameState.currentClueIndex];
        } else if (gameState.currentClueIndex == 1) {
            return foundPokemon.clues[gameState.currentClueIndex];
        } else {
            return "No more clues remaining.🥺"
        }
    } else {
        return "Pokémon not found in the list.🤐";
    }
}



function checkGuess(guess, channel, userstate, gameState) {
    const { currentPokemonName, currentClueIndex } = gameState;
    const foundPokemon = pokemonList.find((p) => p.name === currentPokemonName);
    const username = userstate.username;

    // Load existing user scores from the JSON file
    let userScores = {};

    try {
        const userScoresData = fs.readFileSync('userScores.json', 'utf8');
        userScores = JSON.parse(userScoresData);
    } catch (err) {
        console.error('Error reading user scores:', err);
    }

    if (guess.toLowerCase() === currentPokemonName.toLowerCase()) {
        // Correct guess
        if (!userScores[username]) {
            userScores[username] = 0; // Initialize score if not exists
        }

        // Award points based on the number of tries
        if (currentClueIndex === 0) {
            userScores[username] += 5;
        } else if (currentClueIndex === 1) {
            userScores[username] += 2;
        }

        // Inform the user of their score
        client.say(channel, `🎊Congratulations, @${username}! You guessed it and earned ${currentClueIndex === 0 ? 5 : 2} points.🎊`);
        // End the game
        gameState.currentPokemonName = null;
        gameState.currentGameInProgress = false;
    } else if (currentClueIndex < foundPokemon.clues.length - 1) {
        // Incorrect guess, but more clues are available
        gameState.currentClueIndex++;
        const nextClue = getClue(currentPokemonName, gameState.currentClueIndex);
        gameState.currentGameInProgress = true;
        client.say(channel, `Sorry, @${username}, that's not correct🥺. Keep guessing! 🔍Next clue: ${nextClue}`);
    } else {
        // Incorrect guess and no more clues available
        if (userScores[username] === undefined) {
            userScores[username] = 0; // Initialize score if not exists
        }

        if (userScores[username] > 0) {
            userScores[username] -= 1; // Deduct 1 point unless the user's score is 0
        }
        gameState.currentGameInProgress = false;
        // Inform the user of their score
        client.say(channel, `Sorry, @${username}, that's not correct. You lost 1 point... 🥺`);
        client.say(channel, `⭕Game over! The correct answer was ${currentPokemonName}.`);
    }

    // Save the updated scores back to the JSON file
    fs.writeFile('userScores.json', JSON.stringify(userScores), 'utf8', (err) => {
        if (err) {
            console.error('Error saving user scores:', err);
        }
    });
}


// Game Leaderboard
// Function to display the top 10 users with the most points
function displayTopUsers(channel) {
    // Read the user scores JSON file
    fs.readFile('userScores.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading user scores:', err);
            return;
        }

        try {
            const userScores = JSON.parse(data);

            // Sort users by points in descending order
            const sortedUsers = Object.entries(userScores).sort((a, b) => b[1] - a[1]);

            // Take the top 10 users or fewer if there are fewer than 10 users
            const topUsers = sortedUsers.slice(0, 10);

            // Generate a message with the top users
            const topUsersMessage = `Top 10 Users:\n${topUsers.map(([username, points], index) => `${index + 1}. @${username} (${points} points)`).join('\n')}`;

            // Send the message to the channel
            client.say(channel, topUsersMessage);
        } catch (parseError) {
            console.error('Error parsing user scores JSON:', parseError);
        }
    });
}

// Add this code to listen for !points command
client.on('message', (channel, userstate, message, self) => {
    // ...

    // Check if the message is !points
    if (message.toLowerCase() === '!points') {
        displayTopUsers(channel);
    }

    // ...
});




