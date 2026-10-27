/*
Author: Ahmed Ali
Student Number: 000824753
Email: 000824753@mohawkcollege.ca
Date: 2026-10-26

I, Ahmed Ali, 000824753 certify that this material is my original work.
No other person's work has been used without due acknowledgement.
*/

// Manager area: login, logout, and adding, editing and deleting games.
// The live dashboard is to be filled in later.

const userModel = require("../models/userModel");
const gameModel = require("../models/gameModel");
const { addDisplayFields } = require("./inventoryController");

// Middleware for every manager route. Visitors without a session go to the login page.
exports.requireLogin = function (req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
};

exports.showLogin = function (req, res) {
  if (req.session.user) {
    return res.redirect("/manager");
  }
  res.render("login");
};

exports.login = async function (req, res, next) {
  // Express 5 leaves req.body undefined when a request has no form data
  const form = req.body || {};
  const user = await userModel.checkLogin(form.username, form.password);

  if (!user) {
    return res.status(401).render("login", {
      error: "Those credentials don't check out.",
      username: form.username,
    });
  }

  // A fresh session ID on login, so an old cookie can't be reused to get in
  req.session.regenerate(function (err) {
    if (err) {
      return next(err);
    }
    req.session.user = user.username;
    res.redirect("/manager");
  });
};

exports.logout = function (req, res) {
  req.session.destroy(function () {
    res.redirect("/");
  });
};

// ----- Games -----

exports.showManager = async function (req, res) {
  const games = await gameModel.getAllGames();
  res.render("manager", { games: games.map(addDisplayFields) });
};

// Turns the form's text fields into a game with real numbers
function readForm(form) {
  return {
    title: String(form.title || "").trim(),
    category: String(form.category || "").trim(),
    price: Math.round(Number(form.price) * 100) / 100,
    stock: Number(form.stock),
    min_players: Number(form.min_players),
    max_players: Number(form.max_players),
  };
}

// Returns a message for the first thing wrong with the game, or null if it's fine.
// The database has the same rules, but these messages are friendlier.
function findProblem(game) {
  if (!game.title || !game.category) {
    return "Every case file needs a title and a category.";
  }
  if (!Number.isFinite(game.price) || game.price < 0) {
    return "Price has to be 0 or more.";
  }
  if (!Number.isInteger(game.stock) || game.stock < 0) {
    return "Stock has to be a whole number, 0 or more.";
  }
  if (!Number.isInteger(game.min_players) || !Number.isInteger(game.max_players) ||
      game.min_players < 1 || game.max_players < game.min_players) {
    return "Players have to be whole numbers, and max can't be less than min.";
  }
  return null;
}

// Saves a new game (no id) or changes an existing one, then goes back to the list.
// If something is wrong, the form comes back with the error and what was typed.
async function saveGame(req, res, id) {
  const form = req.body || {};
  const game = readForm(form);
  const formPage = {
    heading: id ? "Edit Case File" : "Open a New Case File",
    action: id ? "/manager/games/" + id + "/edit" : "/manager/games",
    game: form,
  };

  formPage.error = findProblem(game);
  if (!formPage.error) {
    try {
      if (id) {
        await gameModel.updateGame(id, game);
      } else {
        await gameModel.addGame(game);
      }
      return res.redirect("/manager");
    } catch (err) {
      // The UNIQUE rule on title is the only one the checks above can't catch
      if (!String(err.message).includes("UNIQUE")) {
        throw err;
      }
      formPage.error = "There's already a case file for " + game.title + ".";
    }
  }

  res.status(400).render("gameForm", formPage);
}

exports.showAddForm = function (req, res) {
  res.render("gameForm", {
    heading: "Open a New Case File",
    action: "/manager/games",
    game: {},
  });
};

exports.addGame = function (req, res) {
  return saveGame(req, res, null);
};

exports.showEditForm = async function (req, res) {
  const game = await gameModel.getGameById(req.params.id);
  if (!game) {
    return res.status(404).send("No case file with that number.");
  }
  res.render("gameForm", {
    heading: "Edit Case File",
    action: "/manager/games/" + game.id + "/edit",
    game: game,
  });
};

exports.updateGame = async function (req, res) {
  const game = await gameModel.getGameById(req.params.id);
  if (!game) {
    return res.status(404).send("No case file with that number.");
  }
  return saveGame(req, res, game.id);
};

exports.deleteGame = async function (req, res) {
  await gameModel.deleteGame(req.params.id);
  res.redirect("/manager");
};
