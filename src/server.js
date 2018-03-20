const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const User = require('./user.js');

const STATUS_USER_ERROR = 422;
const BCRYPT_COST = 11;

const server = express();
server.use(bodyParser.json());
server.use(session({
  secret: 'e5SPiqsEtjexkTj3Xqovsjzq8ovjfgVDFMfUzSmJO21dtXs4re',
  resave: true,
  saveUninitialized: false,
}));

const sendUserError = (err, res) => {
  res.status(STATUS_USER_ERROR);
  if (err && err.message) {
    res.json({ message: err.message, stack: err.stack });
  } else {
    res.json({ error: err });
  }
};

server.post('/users', (req, res) => {
  const { username, passwordHash } = req.body;
  if (!username || !passwordHash) {
    sendUserError('You must provide a valid username and password to sign up', res);
  }
  const user = new User({ username, passwordHash });
  user.save()
    .then((newUser) => {
      res.status(200).json(newUser);
    })
    .catch((err) => {
      res.status(500).json({ error: 'There was a server error while signing up', err });
    });
});

server.post('/log-in', (req, res) => {
  let { username } = req.body;
  const { password } = req.body;
  username = username.toLowerCase();
  if (!username || !password) {
    sendUserError('You must provide a username and password to sign in', res);
    return;
  }
  User.find({ username })
    .exec((err, found) => {
      if (found.length === 0) {
        res.status(404).json({ error: 'No user found for that username' });
        return;
      }
      if (err) {
        res.status(500).json({ message: 'Internal server error while processing', err });
        return;
      }
      bcrypt.compare(password, found[0].passwordHash, (error, verified) => {
        if (error) {
          res.status(500).json({ error: 'There was in internal error while logging in' });
        } else if (verified) {
          req.session.loggedIn = found[0].id;
          res.status(200).json({ success: true });
        } else sendUserError('The password you entered is invalid', res);
      });
    });
});

const authenticate = (req, res, next) => {
  if (req.session.loggedIn) {
    User.find({ _id: req.session.loggedIn })
      .then((user) => {
        req.user = user;
        next();
      })
      .catch((err) => {
        res.status(500).json({ error: 'There was an internal error while processing' });
      });
  } else {
    sendUserError('You must be logged in to the system', res);
  }
};

server.get('/me', authenticate, (req, res) => {
  res.json(req.user);
});

module.exports = { server };
