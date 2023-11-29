const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('artist')
        .setDescription('Paste your Spotify Artist Link: ')
        .addUserOption(option => option.setName('name').setDescription('Users input name'))
        .addStringOption(option => option.setName('artist').setDescription('The Artist User puts in')),

    async execute(interaction) {
        const target_name = interaction.options.getUser('name');
        const target_artist = interaction.options.getString('artist') ?? 'No reason provided';
        await interaction.reply(`${target_name.username} chose ${target_artist} who is a cool artist`);
    },
};