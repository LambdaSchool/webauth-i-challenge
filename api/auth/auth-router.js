// Require `checkUsernameFree`, `checkUsernameExists` and `checkPasswordLength`
// middleware functions from `auth-middleware.js`. You will need them here!

const express = require('express')
const users = require('../users/users-model')
const bcrypt = require('bcryptjs')
const { checkUsernameFree, checkUsernameExists, checkPasswordLength } = require('./auth-middleware')

const router = express.Router()

router.post('/api/auth/register', checkUsernameFree(), checkPasswordLength(), async (req, res, next) => {
  try {
    const { username, password } = req.body
    const pw = await bcrypt.hash(password, 12)
    const newUser = await users.add({
      username,
      password: pw
    })
    res.status(200).json(newUser)
  } catch (err) {
    next(err)
  }
})

router.post('/api/auth/login', checkUsernameExists(), async (req, res, next) => {
  try {
    const { username, password} = req.body
    const user = await users.findBy({ username}).first()
    const validatePassword = await bcrypt.compare(password, user.password)
    if(!validatePassword) {
      return res.status(401).json({ error: 'credentials invalid' })
    } else {
      req.session.user = user
      res.json({ message: `Greetings, ${user.username}` })
    }
  } catch(err) {
    next(err)
  }
})

router.get('/logout', async (req, res, next) => {
  try {
    if(!req.session || !req.session.user) {
      res.status(200).json({ error: 'no session' })
    } else {
      req.session.destroy((err) => {
        if(err) {
          next(err)
        } else {
          res.status(200).json({ message: 'logout complete' })
        }
      })
    }
  } catch (err) {
    next(err)
  }
})

/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "user_id": 2,
    "username": "sue"
  }

  response on username taken:
  status 422
  {
    "message": "Username taken"
  }

  response on password three chars or less:
  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
 */


/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "message": "Welcome sue!"
  }

  response on invalid credentials:
  status 401
  {
    "message": "Invalid credentials"
  }
 */


/**
  3 [GET] /api/auth/logout

  response for logged-in users:
  status 200
  {
    "message": "logged out"
  }

  response for not-logged-in users:
  status 200
  {
    "message": "no session"
  }
 */

 
// Don't forget to add the router to the `exports` object so it can be required in other modules

module.exports = router
