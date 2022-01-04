const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("ping").setDescription("pong"),
  async execute(interaction, bot) {
    interaction.reply(
      `**P${"o".repeat(
        Math.min(Math.round(bot.ws.ping / 100), 1500)
      )}ng!** (${Math.round(bot.ws.ping)}ms)`
    );
  },
};
