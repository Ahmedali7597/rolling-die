<!--
Author: Ahmed Ali
Student Number: 000824753
Email: 000824753@mohawkcollege.ca
Date: 2026-10-26

I, Ahmed Ali, 000824753 certify that this material is my original work.
No other person's work has been used without due acknowledgement.
-->

# The Rolling Die

An inventory website and Discord bot for The Rolling Die, a board game store and café. The whole thing is styled like a 1940s detective office.

Staff log in to the back office to add, edit and remove games and to change stock counts. Customers can browse the "Evidence Locker" without an account to see what the store carries, what it costs and how many copies are left.

The Discord bot answers the questions regulars usually ask the staff, such as whether a game is in stock or how much it costs. It reads the same SQLite database as the website, so an edit on the site shows up in the bot's next answer.

The manager's dashboard, "The Wiretap", shows each bot command as it happens. It updates over websockets, so nobody has to refresh the page.

Built with Node.js, Express, Mustache, SQLite, discord.js and socket.io.

## Setup

You need Node.js 20.12 or newer and a Discord bot from the [Discord Developer Portal](https://discord.com/developers/applications).

### 1. Install the packages

```
npm install
```

`package.json` already approves the install script for `sqlite3`, so this works on npm 12 as well.

### 2. Create the .env file

Copy `.env.example` to `.env` and fill it in:

| Setting | Where it comes from |
|---|---|
| `DISCORD_TOKEN` | Developer Portal > your app > Bot > Reset Token |
| `CLIENT_ID` | Developer Portal > your app > General Information > Application ID |
| `GUILD_ID` | In Discord, turn on Developer Mode (User Settings > Advanced), then right-click the server and pick Copy Server ID |
| `SESSION_SECRET` | Any long random string. It signs the login cookie. |
| `MANAGER_USER`, `MANAGER_PASS` | The staff login created on the first run |

`.env` is in `.gitignore`, so the token never goes to GitHub.

### 3. Invite the bot to your server

Open this link with your own `CLIENT_ID` in it:

```
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=84992&scope=bot+applications.commands
```

That gives the bot View Channels, Send Messages, Embed Links and Read Message History, plus permission to add slash commands.

### 4. Register the slash commands

```
npm run deploy
```

This registers the commands with the server in `GUILD_ID`, so they show up right away. It only needs to run again if a command changes.

### 5. Start the app

```
npm start
```

This starts the website, the websocket server and the Discord bot together.

### The database

There's no separate setup step for it. The first `npm start` creates `rollingdie.db` with the `games` and `users` tables, 12 sample games and the staff account from `.env`. To start over with fresh sample data, stop the app, delete `rollingdie.db` and run `npm start` again.

## Using it

| Page | Address | Login needed |
|---|---|---|
| Evidence Locker (public inventory and search) | http://localhost:3000/ | No |
| Back Office (add, edit, delete games) | http://localhost:3000/manager | Yes |
| The Wiretap (live bot activity) | http://localhost:3000/manager/dashboard | Yes |

Discord commands:

| Command | What it does |
|---|---|
| `/stock title` | How many copies are on the shelf |
| `/price title` | What a game costs |
| `/players count` | Games that work for a group that size |
| `/compare first second` | Two games side by side: price, players, category and stock |

Titles can be partial and ignore capitals, so `/stock ticket` finds Ticket to Ride.

## Project layout

```
app.js                  Express, socket.io and the Discord bot in one process
models/db.js            Opens SQLite, creates tables, adds sample data
models/gameModel.js     Every game query (used by the website and the bot)
models/userModel.js     Staff accounts and password checks (scrypt hashes)
controllers/            Public inventory page and the manager area
views/                  Mustache templates
bot/commands.js         Slash command definitions and replies
bot/deploy-commands.js  Registers the commands with Discord
public/style.css        The noir theme
```
