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

  new SlashCommandBuilder()
    .setName("players")
    .setDescription("Games that work for a group your size")
    .addIntegerOption((option) =>
      option
        .setName("count")
        .setDescription("How many people are playing")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(30)
    ),

  new SlashCommandBuilder()
    .setName("compare")
    .setDescription("Two games side by side: price, players and stock")
    .addStringOption((option) =>
      option.setName("first").setDescription("First game title").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("second").setDescription("Second game title").setRequired(true)
    ),
];

// Discord caps a message at 2000 characters, so long lists get cut short
const MAX_LINES = 15;

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

  players: async function (interaction) {
    const count = interaction.options.getInteger("count");
    const games = await gameModel.findGamesForPlayers(count);
    const group = count === 1 ? "a solo player" : "a group of " + count;
    if (games.length === 0) {
      return "Nothing in the files fits " + group + ". The staff might have ideas, though.";
    }

    // In-stock games come first (the query sorts them that way)
    const lines = games.slice(0, MAX_LINES).map((game) => {
      const shelf = game.stock > 0 ? game.stock + " on the shelf" : "gone missing";
      return "**" + game.title + "** (" + game.min_players + "–" + game.max_players + " players): " + shelf;
    });
    if (games.length > MAX_LINES) {
      lines.push("...and " + (games.length - MAX_LINES) + " more on the website.");
    }
    return "Games for " + group + ":\n" + lines.join("\n");
  },

  compare: async function (interaction) {
    const firstTitle = interaction.options.getString("first");
    const secondTitle = interaction.options.getString("second");

    // Best match for each name (exact title, or the first partial match)
    const [a] = await gameModel.findGamesByTitle(firstTitle);
    const [b] = await gameModel.findGamesByTitle(secondTitle);
    if (!a) {
      return notFound(firstTitle);
    }
    if (!b) {
      return notFound(secondTitle);
    }
    if (a.id === b.id) {
      return "Both names point to **" + a.title + "**. A comparison needs two different games.";
    }

    const shelf = (game) => (game.stock > 0 ? game.stock + " on the shelf" : "gone missing");
    const gap = Math.abs(a.price - b.price).toFixed(2);
    const priceNote =
      a.price === b.price
        ? "Same price."
        : (a.price < b.price ? a.title : b.title) + " is $" + gap + " cheaper.";

    return [
      "**" + a.title + "** vs **" + b.title + "**",
      "Price: $" + a.price.toFixed(2) + " vs $" + b.price.toFixed(2) + ". " + priceNote,
      "Players: " + a.min_players + "–" + a.max_players + " vs " + b.min_players + "–" + b.max_players,
      "Category: " + a.category + " vs " + b.category,
      "Stock: " + shelf(a) + " vs " + shelf(b),
    ].join("\n");
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
