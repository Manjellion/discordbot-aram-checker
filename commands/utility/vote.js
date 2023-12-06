const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, ComponentType, WorkerContextFetchingStrategy } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vote')
        .setDescription('Vote if you want to join Aram Customs Game'),
    
    async execute(interaction) {
        const confirm = new ButtonBuilder()
            .setCustomId('confirm')
            .setLabel('Confirm')
            .setStyle(ButtonStyle.Success);
        
        const cancel = new ButtonBuilder()
            .setCustomId('no')
            .setLabel('No')
            .setStyle(ButtonStyle.Danger);
        
        const row = new ActionRowBuilder()
            .addComponents(confirm, cancel);
        
        const response = await interaction.reply({
            content: `Join Customs or be noob`,
            components: [row],
        });

        const collectorFilter = i => i.user.id === interaction.user.id;

        try {
            const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60000 });
            const confirmed_players = [];

            if(confirmation.customId === 'confirm') {
                confirmed_players.push(interaction.user.globalName);
                await confirmation.update({ content: `New Player Joined, Player count: ${confirmed_players.length} / 10, Players - ${confirmed_players}`, components: [] });

            } else if (confirmation.customId === 'no') {
                await confirmation.update({ content: `${interaction.user.globalName} Player has declined`, components: [] });
            }

        } catch(e) {
            await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
            console.log('Error: ', e);
        }
    },
};