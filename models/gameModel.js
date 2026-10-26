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

module.exports = { getAllGames };
