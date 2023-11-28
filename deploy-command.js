const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];

// Using Path we can join it through our directory with the folder commands
const folderPath = path.join(__dirname, 'commands');
// We can then read the folder we have joined in the variable above
const commandFolder = fs.readdirSync(folderPath);

// We will loop through the folders within the directory we have selected
for ( const folder of commandFolder ) {
  const commandsPath = path.join(folderPath, folder);
  // Filter out all JavaScript files within each folder inside the directory
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the xported module
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
    }
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all comands in the guild with the current set
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) coomands.`)
    } catch(error) {
        // CAtch and log any errors!
        console.error(error);
    }
})();