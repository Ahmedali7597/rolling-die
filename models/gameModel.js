/*
Author: Ahmed Ali
Student Number: 000824753
Email: 000824753@mohawkcollege.ca
Date: 2026-10-26

I, Ahmed Ali, 000824753 certify that this material is my original work.
No other person's work has been used without due acknowledgement.
*/

// Every SQL query about games goes in this file.
// The website and the Discord bot both use it, so they always see the same data.
// Nothing is cached. Each call asks the database fresh.

const getDb = require("./db");

async function getAllGames() {
  const db = await getDb();
  return db.all("SELECT * FROM games ORDER BY title");
}

// Partial, case-insensitive match on title or category, so "myst" finds the Mystery games
async function searchGames(term) {
  const db = await getDb();
  const pattern = "%" + term + "%";
  return db.all(
    "SELECT * FROM games WHERE title LIKE ? OR category LIKE ? ORDER BY title",
    [pattern, pattern]
  );
}

async function getGameById(id) {
  const db = await getDb();
  return db.get("SELECT * FROM games WHERE id = ?", [id]);
}

async function addGame(game) {
  const db = await getDb();
  await db.run(
    "INSERT INTO games (title, category, price, stock, min_players, max_players) VALUES (?, ?, ?, ?, ?, ?)",
    [game.title, game.category, game.price, game.stock, game.min_players, game.max_players]
  );
}

async function updateGame(id, game) {
  const db = await getDb();
  await db.run(
    "UPDATE games SET title = ?, category = ?, price = ?, stock = ?, min_players = ?, max_players = ? WHERE id = ?",
    [game.title, game.category, game.price, game.stock, game.min_players, game.max_players, id]
  );
}

async function deleteGame(id) {
  const db = await getDb();
  await db.run("DELETE FROM games WHERE id = ?", [id]);
}

module.exports = {
  getAllGames,
  searchGames,
  getGameById,
  addGame,
  updateGame,
  deleteGame,
};
