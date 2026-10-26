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
