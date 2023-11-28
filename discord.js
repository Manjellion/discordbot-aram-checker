// Initialise Library
// Dot net to hide our token
require('dotenv').config();

// fs module helps us navigate commands directory file on Discords API
const fs = require('node:fs');

// Path module creates the  path to access the files and directory
const path = require('node:path');

// Discord.js version ^13.0 require us to explicitly define client intents
const { Client, GatewayIntentBits, Events, Collection } = require('discord.js');
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ] 
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Log In to our bot
client.login(process.env.TOKEN);

client.on('messageCreate', msg => {
  // You can view the msg object here with console.log(msg)
   if (msg.content === 'Hello') {
     msg.reply(`Hello ${msg.author.username}`);
   } else if (msg.content === 'Ping') {
    msg.reply(`Pong ${msg.author.username}`);
  }
});

// Set up new commands for the bot
client.commands = new Collection();

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
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
    }
  }
}

// Receiving command interactions
client.on(Events.InteractionCreate, interaction => {
  if ( !interaction.isChatInputCommand()) return;
  console.log(interaction);
})

// Executing commands by creating an Interaction Event
client.on(Events.InteractionCreate, async interaction => {
  if ( !interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if ( !command ) {
    console.error(`No command matching ${interaction.commandName} was found.`);
  }

  // Set up catch exception 
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if(interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true  });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true  });
    }
  }
});

