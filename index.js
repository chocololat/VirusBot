const { Client, Intents, Collection } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");
const axios = require("axios");
const config = require("./config.json");
const mysql = require('mysql');

(async () => {
  let cmds = [];
  const cmdFiles = fs
    .readdirSync("./commands")
    .filter((file) => file.endsWith(".js"));

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

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  bot.commands.set(command.data.name, command);
}

bot.once("ready", () => {
  console.log("ready");

  bot.db.query(`SELECT * FROM prices`, (err, rows) => {
    if (err) throw err;

    let time = rows[0].next_update - Date.now();

    if (time > 0) {

      setTimeout(() => {
        pricesRefresh(bot);
      }, time);

      setInterval(() => {
        pricesRefresh(bot);
      }, 8 * 60 * 60 * 1000);

    } else {
      pricesRefresh(bot);

      setInterval(() => {
        pricesRefresh(bot);
      }, 8 * 60 * 60 * 1000);

    }

    async function pricesRefresh(bot) {
      
      axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=1,1027,328&convert=EUR', {
        headers: {
          "X-CMC_PRO_API_KEY": config.api.coinmarketcap
        }
      }).then(req => {
        bot.db.query(`UPDATE prices SET bitcoin='${req.data.data['1'].quote.EUR.price.toFixed(2)}', bitcoin_24h='${req.data.data['1'].quote.EUR.percent_change_24h.toFixed(2)}', eth='${req.data.data['1027'].quote.EUR.price.toFixed(2)}', eth_24h='${req.data.data['1027'].quote.EUR.percent_change_24h.toFixed(2)}', monero='${req.data.data['328'].quote.EUR.price.toFixed(2)}', monero_24h='${req.data.data['328'].quote.EUR.percent_change_24h.toFixed(2)}',last_updated='${new Date().getTime()}', next_update='${Number(new Date().getTime() + Number(8 * 60 * 60 * 1000))}'`);  
      });
    }
  });
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
