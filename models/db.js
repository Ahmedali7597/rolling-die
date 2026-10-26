/*
Author: Ahmed Ali
Student Number: 000824753
Email: 000824753@mohawkcollege.ca
Date: 2026-10-26

I, Ahmed Ali, 000824753 certify that this material is my original work.
No other person's work has been used without due acknowledgement.
*/

// Opens the SQLite file and creates the tables if they are missing.
// The first time it runs, it also fills the games table with sample games.

const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

// Games the shop starts with. They are only added when the table is empty.
// Columns: title, category, price, stock, min players, max players
const sampleGames = [
  ["Wingspan", "Strategy", 79.99, 4, 1, 5],
  ["Catan", "Strategy", 54.99, 6, 3, 4],
  ["Ticket to Ride", "Family", 64.99, 3, 2, 5],
  ["Pandemic", "Cooperative", 49.99, 2, 2, 4],
  ["Azul", "Family", 44.99, 5, 2, 4],
  ["Codenames", "Party", 24.99, 8, 2, 8],
  ["Carcassonne", "Family", 39.99, 0, 2, 5],
  ["7 Wonders", "Strategy", 59.99, 2, 3, 7],
  ["Clue", "Mystery", 29.99, 3, 3, 6],
  ["Sherlock Holmes Consulting Detective", "Mystery", 59.99, 1, 1, 8],
  ["Mysterium", "Mystery", 54.99, 2, 2, 7],
  ["Gloomhaven", "Cooperative", 174.99, 1, 1, 4],
];

async function setup() {
  const db = await open({
    filename: path.join(__dirname, "..", "rollingdie.db"),
    driver: sqlite3.Database,
  });

  // The CHECK rules stop bad data at the database, even if a form misses it
  await db.exec(`
    CREATE TABLE IF NOT EXISTS games (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL UNIQUE COLLATE NOCASE,
      category    TEXT    NOT NULL,
      price       REAL    NOT NULL CHECK (price >= 0),
      stock       INTEGER NOT NULL CHECK (stock >= 0),
      min_players INTEGER NOT NULL CHECK (min_players >= 1),
      max_players INTEGER NOT NULL CHECK (max_players >= min_players)
    )
  `);

  const row = await db.get("SELECT COUNT(*) AS count FROM games");
  if (row.count === 0) {
    for (const game of sampleGames) {
      await db.run(
        "INSERT INTO games (title, category, price, stock, min_players, max_players) VALUES (?, ?, ?, ?, ?, ?)",
        game
      );
    }
    console.log("New database created with " + sampleGames.length + " sample games");
  }

  return db;
}

// One connection is shared by the whole app. Saving the promise (not the result)
// means two early callers can't both open the file at the same time.
let dbPromise;

module.exports = function getDb() {
  if (!dbPromise) {
    dbPromise = setup();
  }
  return dbPromise;
};
