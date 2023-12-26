// Initialise Library
// Dot net to hide our token
require('dotenv').config();

// fs module helps us navigate commands directory file on Discords API
const fs = require('node:fs');

// Path module creates the  path to access the files and directory
const path = require('node:path');

// Discord.js version ^13.0 require us to explicitly define client intents
const { Client, GatewayIntentBits, Events, Collection, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js');
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

// Collector with Button on Message
client.on('messageCreate', async (message) => {
  // Set the message interaction with the bot
  if (message.author.bot) return;

  // Make sure the certain message is inputed to initate the voting
  if (message.content !== '.vote') return;

  // Build the buttons for the users to interact with the bot
  const confirmBtn = new ButtonBuilder()
    .setLabel('Confirm')
    .setStyle(ButtonStyle.Success)
    .setCustomId('confirmed');

  const declineBtn = new ButtonBuilder()
    .setLabel('Decline')
    .setStyle(ButtonStyle.Danger)
    .setCustomId('declined');
  
  // Set a action row builder to comodedate and make the two seperate buttons into a singular components
  const buttonRow = new ActionRowBuilder().addComponents(confirmBtn, declineBtn);

  // A message from the bot and the components it will carry, set up in async so make it await before it initiates into the variable
  const reply = await message.reply({ content: `Click on a button noob... YOU HAVE 1 MINUTE`, components: [buttonRow] });

  // Filter in the user interaction
  const filter = (i) => i.user.id === message.author.id;

  // Set up the Discord API collector, set up a collection of users who are interacting with the bot so we can collect their Global Name
  const collector = reply.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter,
    time: 10_000, // Change to 60_000 on launch (10_000) is being used to test in shortcase
  });

  // Set up a temp array, this will reset in each time the bot is called
  const confirmed = [];
  confirmed.slice(0, 11);

  // Collection will start on an interaction from user and bot
  collector.on('collect', (interaction) => {
    // Make sure the array hasn't reached max capacity
    if(confirmed.length !== 10) {
      // Check if user has clicked on confirmed
      if(interaction.customId === 'confirmed') {
        // Push the users name into the array
        confirmed.push(interaction.user.globalName);
        // Let user know they have successfully joined
        interaction.reply(`${interaction.user.globalName} has joined, player count - ${confirmed.length} / 10`);
        return;
      }
    }
    // If user declines
    if(interaction.customId === 'declined') {
      interaction.reply(`${interaction.user.globalName} is a noob`);
      return;
    }
  })

  // When the timer runs out from the collection, we want to disable the buttons so that no one else can interact with the bot
  collector.on('end', () => {
    confirmBtn.setDisabled(true);
    declineBtn.setDisabled(true);

    // Send a message to the channel the bot is in with the final list of confirmed players
    message.channel.send(`Players: ${confirmed.length} / 10 have confirmed`)
    // Loop through the temporary array and display users who have confirmed
    for (var i = 0; i < confirmed.length; i++) {
      message.channel.send(confirmed[i]);
    }

    reply.edit({
      content: 'You are out of time noob',
      components: [buttonRow]
    })
  })

})

// Log In to our bot
client.login(process.env.TOKEN);

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
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
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

