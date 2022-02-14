const { Client, Intents, Collection } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");
const config = require("./config.json");
const mysql = require('mysql');

(async () => {
  let cmds = [];
  const cmdFiles = fs
    .readdirSync("./commands")
    .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const command = require(`./commands/${file}`);
      bot.commands.set(command.data.name, command);
    }

  for (const file of cmdFiles) {
    const cmd = require(`./commands/${file}`);
    cmds.push(cmd.data.toJSON());
  }

  try {
    const rest = new REST({ version: "9" }).setToken(config.token);
    console.log("started refreshing /cmds");

    await rest.put(
      Routes.applicationGuildCommands(config.clientID, "858419638743072809"),
      { body: cmds }
    );

    console.log("reloaded /cmds");
  } catch (e) {
    console.error(e);
  }
})();

const bot = new Client({ intents: [Intents.FLAGS.GUILDS] });

bot.commands = new Collection();

bot.db = mysql.createConnection({
  host: '161.97.156.165',
  user: 'root',
  password: config.dbPassword,
  database: 'cryptobot'
});
bot.db.connect();

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

bot.once("ready", () => {
  console.log("ready");
});

bot.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  const command = bot.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction, bot);
  } catch (e) {
    console.error(e);
  }
});

bot.login(config.token);
