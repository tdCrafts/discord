const { REST, Routes } = require('discord.js');
const fs = require("fs");

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

let commands = [];

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands = [
        ...commands,
        command.data
    ]
}

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

module.exports = (async client => {
    try {
        await rest.put(
			Routes.applicationCommands(process.env.APPLICATION_ID),
			{ body: commands },
		);

        console.log('Successfully set commands');
    } catch (error) {
        console.error(error);
    }
});
