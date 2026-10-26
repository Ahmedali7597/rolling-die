/*
Author: Ahmed Ali
Student Number: 000824753
Email: 000824753@mohawkcollege.ca
Date: 2026-10-26

I, Ahmed Ali, 000824753 certify that this material is my original work.
No other person's work has been used without due acknowledgement.
*/

// Public inventory page. Read only, no login needed.
// Empty list until the database is hooked up.

exports.showInventory = function (req, res) {
  res.render("inventory", { games: [] });
};
