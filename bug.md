# Bug List

The following bugs and test issues were encountered while building the project. All are reported as resolved in the notes.

## 1. SQLite install script was blocked

- **Commit:** `b115b08` — “Set up project skeleton”
- **Problem:** `npm install` completed with a warning that the `sqlite3` install script was blocked. Since `sqlite3` needs that script to install its native database driver, the app could not open the database.
- **Cause:** npm 12 requires install scripts to be approved.
- **Resolution:** Approved the `sqlite3` install script with `npm install-scripts approve sqlite3`. This added an `allowScripts` entry to `package.json`, and a fresh clone was used to verify the install.
- **Status:** Resolved.

## 2. Empty login request caused a server error

- **Commit:** `b3862a2` — “Add manager login and logout”
- **Problem:** Submitting a login request without form data caused a 500 error: `Cannot read properties of undefined, reading username`.
- **Cause:** In Express 5, `req.body` is undefined when a request has no form data.
- **Resolution:** Read the form data as `req.body || {}` so an empty submission receives the normal “Those credentials don't check out” response.
- **Status:** Resolved.

## 3. Test script deleted the wrong game

- **Commit:** `7e41bbd` — “Let staff add, edit and delete games”
- **Problem:** The test intended to add, edit, and delete a test game, but deleted Wingspan instead.
- **Cause:** The test selected the last Edit link on the page, while the game list was sorted by title. The app itself was working as intended.
- **Resolution:** Reset the database and updated the test to locate the game by name.
- **Status:** Resolved; test issue, not an application bug.

## Other validation

The dashboard work in `ea33b6f` did not reveal a bug. A logged-out visitor was explicitly tested and refused access to the websocket.
