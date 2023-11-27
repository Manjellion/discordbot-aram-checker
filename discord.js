// Initialise dotenv
require('dotenv').config();

// Discord.js version ^13.0 require us to explicitly define client intents
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
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
   }
});