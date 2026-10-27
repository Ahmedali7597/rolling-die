/*
Author: Ahmed Ali
Student Number: 000824753
Email: 000824753@mohawkcollege.ca
Date: 2026-10-26

I, Ahmed Ali, 000824753 certify that this material is my original work.
No other person's work has been used without due acknowledgement.
*/

// Public inventory page. Read only, no login needed.

const gameModel = require("../models/gameModel");

// Mustache can't format numbers, so the display text is built here
function addDisplayFields(game) {
  game.priceText = game.price.toFixed(2);
  game.players = game.min_players === game.max_players
    ? String(game.min_players)
    : game.min_players + "–" + game.max_players;
  return game;
}

exports.showInventory = async function (req, res) {
  const search = String(req.query.search || "").trim();

  const games = search
    ? await gameModel.searchGames(search)
    : await gameModel.getAllGames();

  res.render("inventory", {
    search: search,
    hasGames: games.length > 0,
    games: games.map(addDisplayFields),
  });
};

// The manager page shows prices the same way
exports.addDisplayFields = addDisplayFields;
