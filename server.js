const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const userRouter = require('./users/UserRouter');
const User = require('./users/UserModel');
const localHost = 'localhost:27017';
const database = 'usersdb';
const server = express();
const port = process.env.PORT || 8000;

mongoose
    .connect(`mongodb://${localHost}/${database}`)
    .then(response => {
        console.log("Connection Successful")
    })
    .catch(error => {
        console.log("Connection Failed")
    });

function authenticate(req, res, next) {
    if(req.body.password === 'mellon') {
        next();
    } else {
        res.status(401).send("You Shall Not Pass!")
    }
}

server.use(express.json());
server.use('/api', userRouter);
server.use(
    session({
        secret: 'nobody tosses a dwarf!',
        cookie: { maxAge: 1 * 24 * 60 * 60 * 1000 },
        httpOnly: true,
        secure: false,
        resave: true,
        saveUninitialized: false,
        name: "noname"
    })
);

server.get('/', (req, res) => {
    if (req.session && req.session.username) {
        res.send(`Welcome Back, ${req.session.username}`)
    } else {
        res.send("Login Attempt Unsuccessful")
    }
});

server.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    User
        .findOne({ username })
        .then(user => {
            if(user) {
                user
                    .isPasswordValid(password)
                    .then(isValid => {
                        if(isValid) {
                            req.session.username = user.username;
                            res.send("Login Successful")
                        } else {
                            res.status(401).send("Invalid Credentials")
                        }
                })
            } else {
                res.status(401).send("Invalid Credentials")
            }
        })
        .catch(error => {
            res.status(500).error({ error: error.message })
        })
})

server.listen(port, () => {
    console.log(`\n=== API up on port: ${port} ===\n`);
});
