const { Client, Intents, Collection } = require('discord.js');
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const config = require("./config.json");
const { register } = require('./structures/RegisterCommands');
const fs = require('fs');

(async() => {
    let cmds = [];
    const cmdFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    for (const file of cmdFiles) {
      const cmd = require(`./commands/${file}`);
      cmds.push(cmd.data.toJSON());
    }
  
    try {
        const rest = new REST({ version: "9" }).setToken(config.token);
      console.log("started refreshing /cmds");
  
      await rest.put(Routes.applicationCommands(config.clientID), { body: cmds });
  
      console.log("reloaded /cmds");
    } catch (e) {
      console.error(e);
    }
  })();

const bot = new Client({ intents: [Intents.FLAGS.GUILDS] });

bot.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	bot.commands.set(command.data.name, command);
}

bot.once('ready', () => {
    console.log('ready');
})

bot.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const command = bot.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (e) {
        console.error(e);
    }
})

bot.login(config.token);