const mongoose = require('mongoose');
const express = require('express');
const User = require ('./User.js');

mongoose
  .connect('mongodb://localhost/authdb')
  .then(conn => {
    console.log('n\ ===connected to mongo === \n')
  })
  .catch(error => console.log('issues connecting to mongo', error));

const server = express();

//authtication method, might need tinkering later
function authenticate(req, res, next) {
  const {username, password } = req.body;
  User.findOne({ username }).then(user => {
    if (user) {
      user.comparePassword(password).then(isMatch => {
        if (isMatch) {
          res.send('Welcome to the mines of moria fam');
        } else {
          res.status(401).send('Invalid Username/password');
        }
      });
    } else
    res
      .status(404)
      .send('Invalid Username/Password!')
  }); 
}

server.use(express.json());

//meant to see if the server is actually working
server.get('/', (req, res) => {
  res.send({api: 'running'})
})

//register user, adds to mongo database on completetion 
server.post('/api/register', (req, res) => {
  const user = new User (req.body);
  user
    .save()
    .then(user => {
      res.status(201).json({ user })
    })
    .catch(error => {
      res.status(500).send('error')
    });
})

//login function
server.post("/api/login", authenticate, (req, res) => {
  res.send("Welcome to the Mines of Moria");
});


//grabs users
server.get("/api/users", (req, res) => {
  User.find()
    .then(users => {
      res.json(users);
    })
    .catch(error => {
      res.status(500).json({
        error: 'Could not retrieve users',
      });
    });
});


server.listen(5000, () => console.log('n\ === API Running! === \n'))