const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const dayjs = require('dayjs');
const emojis = require('../emojis.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("prices")
        .setDescription("prices description"),
    async execute(interaction, bot) {

        bot.db.query(`SELECT * FROM prices`, (err, rows) => {
            if (err) throw err;

            let embed = new MessageEmbed()
            .setTitle("CoinMarketCap currency prices.")
            .setDescription(`**Refreshed every 8h** | Last refresh: __**${dayjs(Number(rows[0].last_updated)).format("DD/MM/YYYY HH:mm:ss")}**__`)
            .addField(`${emojis.bitcoin} Bitcoin [ASIC Mining]`, `Price: ${rows[0].bitcoin}€\nChange (24h): ${rows[0].bitcoin_24h}%`)
            .addField(`${emojis.eth} Ethereum [GPU Mining]`, `Price: ${rows[0].eth}€\nChange (24h): ${rows[0].eth_24h}%`)
            .addField(`${emojis.monero} Monero [CPU Mining]`, `Price: ${rows[0].monero}€\nChange (24h): ${rows[0].monero_24h}%`)
            .setFooter({ text: "Depending on which method you're using, you can sell your coins using /sell !" });
        
        interaction.reply({ embeds: [embed] });
        });
    },
};
