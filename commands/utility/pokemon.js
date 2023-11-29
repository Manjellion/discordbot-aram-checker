const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, ActionRowBuilder, ComponentType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('pokemon')
    .setDescription('Pick a pokemon'),

    async execute(interaction) {
        const select = new StringSelectMenuBuilder()
            .setCustomId('starter')
            .setPlaceholder('Make a selecetion!')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Bulbasaur')
                    .setDescription('The dual-type Grass/Poison Seed Pokemon.')
                    .setValue('bulbasaur'),
                new StringSelectMenuOptionBuilder()
					.setLabel('Charmander')
					.setDescription('The Fire-type Lizard Pokémon.')
					.setValue('charmander'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Squirtle')
					.setDescription('The Water-type Tiny Turtle Pokémon.')
					.setValue('squirtle'),
            );

        const row = new ActionRowBuilder()
                .addComponents(select);

        const response =  await interaction.reply({
            content: 'Choose your starter!',
            components: [row],
        });

        const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000  });
        const selectArr = [];
        collector.on('collect', async i => {
            const selection = i.values[0];
            selectArr.push(selection);
            await i.reply(`${i.user} has selected ${selection}, stored: ${selectArr}, !`);
        });

    },
};