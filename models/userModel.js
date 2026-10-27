/*
Author: Ahmed Ali
Student Number: 000824753
Email: 000824753@mohawkcollege.ca
Date: 2026-10-26

I, Ahmed Ali, 000824753 certify that this material is my original work.
No other person's work has been used without due acknowledgement.
*/

// Looks up staff accounts and checks passwords for the manager login.
// Passwords are hashed with scrypt from Node's built-in crypto module.

const crypto = require("crypto");
const getDb = require("./db");

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

// Creates the first staff account from MANAGER_USER and MANAGER_PASS in .env.
// Does nothing once any account exists, so restarting the app is safe.
async function addFirstManager(username, password) {
  const db = await getDb();
  const row = await db.get("SELECT COUNT(*) AS count FROM users");
  if (row.count > 0) {
    return;
  }
  if (!username || !password) {
    console.log("No staff account yet. MANAGER_USER and MANAGER_PASS are missing from .env.");
    return;
  }

  const salt = crypto.randomBytes(16).toString("hex");
  await db.run("INSERT INTO users (username, password) VALUES (?, ?)", [
    username,
    salt + ":" + hashPassword(password, salt),
  ]);
  console.log("Staff account created for " + username);
}

// Returns the user if the username and password match, otherwise null
async function checkLogin(username, password) {
  const db = await getDb();
  const user = await db.get("SELECT * FROM users WHERE username = ?", [String(username || "")]);
  if (!user) {
    return null;
  }

  const [salt, savedHash] = user.password.split(":");
  const attempt = hashPassword(String(password || ""), salt);

  // timingSafeEqual takes the same time whether the first or last character is wrong
  const match = crypto.timingSafeEqual(Buffer.from(savedHash, "hex"), Buffer.from(attempt, "hex"));
  return match ? user : null;
}

module.exports = { addFirstManager, checkLogin };
