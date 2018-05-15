const express = require("express");

const User = require("./User");

const router = express.Router();

// /api/users
// GET
router.route("/").get((req, res) => {
  User.find()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(error => {
      res.status(500).json({
        error: "There was an error getting users."
      });
    });
});

// POST
router.route("/").post((req, res) => {
  const { username, password } = req.body;
  const user = new User(req.body);

  user
    .save()
    .then(newUser => {
      res.status(201).json(newUser);
    })
    .catch(error => {
      res.status(500).json({
        error: "There was an error posting the new user."
      });
    });
});

module.exports = router;
