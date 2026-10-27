/*
Author: Ahmed Ali
Student Number: 000824753
Email: 000824753@mohawkcollege.ca
Date: 2026-10-26

I, Ahmed Ali, 000824753 certify that this material is my original work.
No other person's work has been used without due acknowledgement.
*/

// Manager area: login, logout, and the pages only staff can see.
// Game editing and the live dashboard are to be filled in later.

const userModel = require("../models/userModel");

// Middleware for every manager route. Visitors without a session go to the login page.
exports.requireLogin = function (req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
};

exports.showLogin = function (req, res) {
  if (req.session.user) {
    return res.redirect("/manager");
  }
  res.render("login");
};

exports.login = async function (req, res, next) {
  // Express 5 leaves req.body undefined when a request has no form data
  const form = req.body || {};
  const user = await userModel.checkLogin(form.username, form.password);

  if (!user) {
    return res.status(401).render("login", {
      error: "Those credentials don't check out.",
      username: form.username,
    });
  }

  // A fresh session ID on login, so an old cookie can't be reused to get in
  req.session.regenerate(function (err) {
    if (err) {
      return next(err);
    }
    req.session.user = user.username;
    res.redirect("/manager");
  });
};

exports.logout = function (req, res) {
  req.session.destroy(function () {
    res.redirect("/");
  });
};

exports.showManager = function (req, res) {
  res.render("manager");
};
