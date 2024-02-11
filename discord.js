const { Client, Collection, GatewayIntentBits } = require('discord.js');
const fs = require("fs");

const grabFiles = path => fs.readdirSync(path).filter(file => file.endsWith('.js'));

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

client.commands = new Collection();
client.listeners = new Collection();

const commandFiles = grabFiles('./commands');
const listenerFiles = grabFiles('./listeners');

// process command files
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

// process listener files
for (const file of listenerFiles) {
    const listener = require(`./listeners/${file}`);
    client.listeners.set(listener.name, listener);
}

// Register listeners.
client.listeners.forEach(listener => {
    client[listener.eventType](listener.eventName, listener.listener);
});

// Log in to Discord with your client's token
client.login(process.env.BOT_TOKEN);

require("./registerSlashCommands")(client);
