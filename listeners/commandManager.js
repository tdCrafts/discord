const {EmbedBuilder, CommandInteraction} = require("discord.js");

const listener = {
    name: 'commandManager',
    eventName: 'interactionCreate',
    eventType: 'on',
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @returns 
     */
    listener (interaction) {
        if (!interaction.isCommand()) return;
    
        if (!interaction.client.commands.has(interaction.commandName)) return;
    
        let cmd = interaction.client.commands.get(interaction.commandName);

        const success = message => {
            const embed = new EmbedBuilder()
                .setTitle("Success!")
                .setDescription(message)
                .setColor(0x29ab4c);

            interaction.reply({embeds: [embed], ephemeral: true})
        }

        const error = message => {
            const embed = new EmbedBuilder()
                .setTitle("Error!")
                .setDescription(message)
                .setColor(0xe83b3b);

            interaction.reply({embeds: [embed], ephemeral: true})
        }

        interaction.success = success;
        interaction.error = error;

        try {
            cmd.execute(interaction);
        } catch (error) {
            console.error(error);
            interaction.reply('***There was an error trying to execute that command!***');
        }
    }
};

module.exports = listener;
