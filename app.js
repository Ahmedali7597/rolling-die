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
const session = require("express-session");
const mustacheExpress = require("mustache-express");
const getDb = require("./models/db");
const userModel = require("./models/userModel");
const inventoryController = require("./controllers/inventoryController");
const managerController = require("./controllers/managerController");

const app = express();

app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");
app.set("views", __dirname + "/views");

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: false }));

// Login sessions. sameSite "lax" stops other websites from sending
// form posts (like delete) with the manager's cookie attached.
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax" },
}));

// Every page can see who is logged in, so the header shows the right links
app.use(function (req, res, next) {
  res.locals.user = req.session.user;
  next();
});

// Public page, anyone can look
app.get("/", inventoryController.showInventory);

// Login and logout
app.get("/login", managerController.showLogin);
app.post("/login", managerController.login);
app.post("/logout", managerController.logout);

// Staff only
app.get("/manager", managerController.requireLogin, managerController.showManager);

// The database and the first staff account are set up before the server starts
getDb()
  .then(function () {
    return userModel.addFirstManager(process.env.MANAGER_USER, process.env.MANAGER_PASS);
  })
  .then(function () {
    app.listen(3000, function () {
      console.log("The Rolling Die is open at http://localhost:3000");
    });
  });
