const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, ComponentType } = require('discord.js');

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
            const confirmed_players = [10];
            const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000  });

            if(confirmation.customId === 'confirm') {
                confirmed_players.push();
                await confirmation.update({ content: `New Player Joined`, components: [] });
                collector.on('collect', async i => {
                    await i.reply(`${i.user}, \/\s\/
                         \/\s\/
                        ${confirmed_players.length}/6
                        `);
                });
            } else if (confirmation.customId === 'no') {
                await confirmation.update({ content: 'Player has declined', components: [] });
            }
        } catch(e) {
            await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
            console.log('Error: ', e);
        }
    },
};