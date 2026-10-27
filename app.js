/*
Author: Ahmed Ali
Student Number: 000824753
Email: 000824753@mohawkcollege.ca
Date: 2026-10-26

I, Ahmed Ali, 000824753 certify that this material is my original work.
No other person's work has been used without due acknowledgement.
*/

// Entry point. Runs the web server, the websocket server and the Discord bot
// in the same process, so the bot can push updates straight to the dashboard.

// Loads DISCORD_TOKEN and the other secrets from .env into process.env
process.loadEnvFile();

const express = require("express");
const session = require("express-session");
const mustacheExpress = require("mustache-express");
const getDb = require("./models/db");
const userModel = require("./models/userModel");
const inventoryController = require("./controllers/inventoryController");
const managerController = require("./controllers/managerController");
const { Client, GatewayIntentBits, Events, MessageFlags } = require("discord.js");
const commands = require("./bot/commands");

const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");
app.set("views", __dirname + "/views");

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: false }));

// Login sessions. sameSite "lax" stops other websites from sending
// form posts (like delete) with the manager's cookie attached.
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax" },
});
app.use(sessionMiddleware);

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

// Staff only. This one line guards every URL that starts with /manager.
app.use("/manager", managerController.requireLogin);
app.get("/manager", managerController.showManager);
app.get("/manager/games/new", managerController.showAddForm);
app.post("/manager/games", managerController.addGame);
app.get("/manager/games/:id/edit", managerController.showEditForm);
app.post("/manager/games/:id/edit", managerController.updateGame);
app.post("/manager/games/:id/delete", managerController.deleteGame);
app.get("/manager/dashboard", managerController.showDashboard);

// ----- Websockets -----
// The socket connection reads the same login cookie as the website.
// Visitors who aren't logged in get refused, so only staff hear the bot activity.
io.engine.use(sessionMiddleware);
io.use(function (socket, next) {
  if (socket.request.session && socket.request.session.user) {
    next();
  } else {
    next(new Error("Staff only"));
  }
});

// ----- Discord bot -----
// Slash commands only need the Guilds intent. The bot never reads normal chat messages.
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, function () {
  console.log("Bot is online as " + client.user.tag);
});

// Short version of a bot reply for the dashboard: first line, no bold marks
function summarize(text) {
  const lines = text.replace(/\*\*/g, "").split("\n");
  return lines.length > 1 ? lines[0] + " (+" + (lines.length - 1) + " more)" : lines[0];
}

client.on(Events.InteractionCreate, async function (interaction) {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  let answer;
  try {
    answer = summarize(await commands.handleCommand(interaction));
  } catch (err) {
    console.error("/" + interaction.commandName + " failed:", err);
    answer = "Error: the bot couldn't answer";
    // Only the person who asked sees this message
    if (!interaction.replied) {
      await interaction.reply({
        content: "The files are jammed. Give it a minute and ask again.",
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  // Live update for every dashboard that's open right now
  io.emit("botactivity", {
    time: new Date().toISOString(),
    user: interaction.user.username,
    command: interaction.commandName,
    args: interaction.options.data.map((option) => option.name + ": " + option.value).join(", "),
    answer: answer,
  });
});

// The database and the first staff account are set up before the server starts
getDb()
  .then(function () {
    return userModel.addFirstManager(process.env.MANAGER_USER, process.env.MANAGER_PASS);
  })
  .then(function () {
    http.listen(3000, function () {
      console.log("The Rolling Die is open at http://localhost:3000");
    });
    return client.login(process.env.DISCORD_TOKEN);
  });
