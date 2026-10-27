/*
Author: Ahmed Ali
Student Number: 000824753
Email: 000824753@mohawkcollege.ca
Date: 2026-10-26

I, Ahmed Ali, 000824753 certify that this material is my original work.
No other person's work has been used without due acknowledgement.
*/

// Registers the slash commands with Discord (npm run deploy).
// Commands are registered to one server (GUILD_ID), which makes changes show up
// right away. Global commands can take up to an hour to appear.

process.loadEnvFile(__dirname + "/../.env");

const { REST, Routes } = require("discord.js");
const { definitions } = require("./commands");

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

rest
  .put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
    body: definitions.map((command) => command.toJSON()),
  })
  .then(function (saved) {
    console.log("Registered " + saved.length + " commands: " + saved.map((c) => "/" + c.name).join(", "));
  })
  .catch(function (err) {
    console.error("Could not register commands:", err.message);
  });
