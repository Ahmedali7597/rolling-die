/*
Author: Ahmed Ali
Student Number: 000824753
Email: 000824753@mohawkcollege.ca
Date: 2026-10-26

I, Ahmed Ali, 000824753 certify that this material is my original work.
No other person's work has been used without due acknowledgement.
*/

// Slash command definitions and what the bot says back.
// Every reply reads the database at the moment the command comes in,
// so a change made on the website shows up in the very next answer.

const { SlashCommandBuilder } = require("discord.js");
const gameModel = require("../models/gameModel");

const definitions = [
  new SlashCommandBuilder()
    .setName("stock")
    .setDescription("How many copies of a game are on the shelf")
    .addStringOption((option) =>
      option.setName("title").setDescription("Game title, or part of it").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("price")
    .setDescription("What a game costs at the store")
    .addStringOption((option) =>
      option.setName("title").setDescription("Game title, or part of it").setRequired(true)
    ),
];

function notFound(title) {
  return 'No record of "' + title + '" in our files. A shorter part of the name might turn something up.';
}

// Each handler gets the interaction and returns the text to send back
const handlers = {
  stock: async function (interaction) {
    const title = interaction.options.getString("title");
    const games = await gameModel.findGamesByTitle(title);
    if (games.length === 0) {
      return notFound(title);
    }
    return games
      .map((game) =>
        game.stock > 0
          ? "**" + game.title + "**: " + game.stock + " on the shelf."
          : "**" + game.title + "**: gone missing. None in stock right now."
      )
      .join("\n");
  },

  price: async function (interaction) {
    const title = interaction.options.getString("title");
    const games = await gameModel.findGamesByTitle(title);
    if (games.length === 0) {
      return notFound(title);
    }
    return games
      .map((game) => "**" + game.title + "** goes for $" + game.price.toFixed(2) + ".")
      .join("\n");
  },
};

// Runs the matching handler and replies in Discord. Returns the reply text.
async function handleCommand(interaction) {
  const handler = handlers[interaction.commandName];
  if (!handler) {
    return null;
  }
  const text = await handler(interaction);

  // allowedMentions stops a title like "@everyone" from pinging the whole server
  await interaction.reply({ content: text, allowedMentions: { parse: [] } });
  return text;
}

module.exports = { definitions, handleCommand };
