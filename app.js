/*
Author: Ahmed Ali
Student Number: 000824753
Email: 000824753@mohawkcollege.ca
Date: 2026-10-26

I, Ahmed Ali, 000824753 certify that this material is my original work.
No other person's work has been used without due acknowledgement.
*/

// Entry point. Runs the web server, and later the Discord bot in the same process.

// Loads DISCORD_TOKEN and the other secrets from .env into process.env
process.loadEnvFile();

const express = require("express");
const mustacheExpress = require("mustache-express");
const getDb = require("./models/db");
const inventoryController = require("./controllers/inventoryController");

const app = express();

app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");
app.set("views", __dirname + "/views");

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: false }));

// Public page, anyone can look
app.get("/", inventoryController.showInventory);

// The database is set up before the server starts, so the first visitor never waits on it
getDb().then(function () {
  app.listen(3000, function () {
    console.log("The Rolling Die is open at http://localhost:3000");
  });
});
