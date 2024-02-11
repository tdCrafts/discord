const { SlashCommandBuilder, CommandInteraction } = require("discord.js");

const command = {
    /**
     * Command data
     * @type {SlashCommandBuilder}
     */
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Pings the Discord bot!"),
    /**
     * Command executor
     * @param {CommandInteraction} interaction 
     */
    execute: interaction => {
        interaction.success("Pong!");
    }
}

module.exports = command;
