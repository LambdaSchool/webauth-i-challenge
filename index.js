const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs')

const db = require('./db/db.js')

const server = express();

server.use(express.json());
server.use(cors());
server.use(helmet());

server.get('/', (req,res) => {
    res.status(200).json({message: "server is running"})
})

server.post('/new/', (req,res) => {
    const creds = req.body;
    const hash = bcrypt.hashSync(creds.password, 3);
    creds.password = hash;

    db('users')
        .insert(creds)
        .then(ids => {
            const id = ids[0];//cause it return a single array?
            res.status(201).json(id);
        }).catch(err => res.status(500).send(err))
})

server.post('/login/', (req,res) => {
    const creds = req.body;

    db('users')
        .where({username: creds.username})
        .first()
        .then(user => {
            if(user && bcrypt.compareSync(creds.password, user.password)){
                res.status(200).json({message: "welcome!"});
            } else {
                res.status(401).json({message: "not authorized"})
            }
            const id = ids[0];//cause it return a single array?
        }).catch(err => res.status(500).send(err))
})

server.get('/users/', (req,res) => {
    db('users')
        .then(users => {
        
            res.status(201).json(users);
        }).catch(err => res.status(500).send(err))
})

server.listen(4500, () => {console.log('\n === server running on 4500 === \n')})