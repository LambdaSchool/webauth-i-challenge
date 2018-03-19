const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');

const STATUS_USER_ERROR = 422;
const BCRYPT_COST = 11;

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

const hashPw = (req, res, next) => {
  const { password } = req.body;
  if (!password || password.length === 0) {
    sendUserError('Please provide a password.', res);
  } else {
    bcrypt.hash(password, BCRYPT_COST, (err, hashedPw) => {
      if (err) {
        sendUserError(err, res);
      } else {
        req.body.hashedPw;
      }
      next();
    });
  }
};

// TODO: implement routes

server.post('/users', hashPw, (req, res) => {
  const { username, pw } = req.body;
  const user = new User({ username, passwordHash: pw });
  user.save((err, savedUser) => {
    if (err || !savedUser) {
      sendUserError('No user was saved', res);
    } else {
      req.session.username = savedUser.username;
      res.json(savedUser);
    }
  });
});

// TODO: add local middleware to this route to ensure the user is logged in
server.get('/me',sendUserError, (req, res) => {
  // Do NOT modify this route handler in any way.
  res.json(req.user);
  
});

module.exports = { server };
