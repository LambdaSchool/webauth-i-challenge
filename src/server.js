const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');

const bcrypt = require('bcrypt');

const STATUS_USER_ERROR = 422;
const BCRYPT_COST = 11;

const User = require('./user.js');

mongoose
  .connect('mongodb://localhost/data', { useMongoClient: true })
  .then(() => {
    console.log('\n=== Connected to MongoDb ===\n');
  })
  .catch(error => console.log('Error Connecting to the database', error));

const server = express();
// to enable parsing of json bodies for post requests
server.use(bodyParser.json());
server.use(session({
  secret: 'e5SPiqsEtjexkTj3Xqovsjzq8ovjfgVDFMfUzSmJO21dtXs4re'
}));

/* Sends the given err, a string or an object, to the client. Sets the status
 * code appropriately. */
const sendUserError = (err, res) => {
  res.status(STATUS_USER_ERROR);
  if (err && err.message) {
    res.json({ message: err.message, stack: err.stack });
  } else {
    res.json({ error: err });
  }
};

// TODO: implement routes
server
  .post('/users', (req, res) => {
    const { username, password } = req.body;
    const passwordHash = bcrypt.hash(password, BCRYPT_COST, (err, hash) => {
      if (err) {
        return err;
      }
      console.log(hash);
      return hash;
    });
    console.log(passwordHash);
    const user = new User({ username, passwordHash });
    user
      .save()
      .then(savedUser => res.status(201).json(savedUser))
      .catch(err => res.status(500).json(err));
  });

// TODO: add local middleware to this route to ensure the user is logged in
server.get('/me', (req, res) => {
  // Do NOT modify this route handler in any way.
  res.json(req.user);
});

module.exports = { server };
