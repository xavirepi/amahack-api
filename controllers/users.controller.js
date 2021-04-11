const createError = require('http-errors')
const jwt = require('jsonwebtoken')
const User = require('../models/User.model')

module.exports.create = (req, res, next) => {
  User.findOne({ email: req.body.email }) // First of all we check whether the user exists in the DB - It returns a promise
    .then(user => {
      if (user) { // If the user exists we must notify an error that the user can't be created
        // Error if email is already in the database
        next(createError(400, { errors: { email: 'This email is already in use' } })) // The error is created usin createError middleware (App.js line 28)
      } else { // In case it doesn't exists creates the user
        // User creation
        return User.create(req.body) // Takes the req.body sent in the request
          .then(user => res.status(201).json(user)) // Sends the status and the user object as a JSON is returned
      }
    })
    .catch(next)
}

module.exports.get = (req, res, next) => {
  User.findById(req.currentUser) // The id will be stored into currentUser
    .then(user => {
      if(!user) {
        next(createError(404, 'User not found'))
      } else {
        res.json(user)
      }
    })
}

module.exports.authenticate = (req, res, next) => { // This used to be saved included inside passport config
  const { email, password } = req.body

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        next(createError(404, { errors: { email: 'Email or password are not valid'} })) // To avoid compromising our emails DB in the message we should avoid specifying the error
      } else {
        return user.checkPassword(password) // .checkPassword() static method returns a promise because it takes a bit long to hash
          .then(match => { // The previous promise returns either true or false and this is passed to the argument
            if (!match) { // If false (not match) --> Return an error message (again not specific to protect our emails DB)
              next(createError(404, { errors: { email: 'Email or password are not valid'} }))
            } else { // If user.checkPassword static method returns true then we create the JWT using the library sign method (Docs: https://github.com/auth0/node-jsonwebtoken)
              // Generate JWT Token
              res.json({
                access_token: jwt.sign( // The token that the Front will save to make requests through JWT (Saved into Local Storage)
                  { id: user._id }, // We send "id" to the payload (this information will be public)
                  process.env.JWT_SECRET || 'JWT Secret - It should be changed', // The secret is use to sign - whithout it the token can't be verified and it won't be returned
                  {
                    expiresIn: '5m' // Specified in the docs how to indicate the expiration (Docs: https://github.com/auth0/node-jsonwebtoken)
                  }
                )
              })
            }
          })
      }
    })
    .catch(next) // As user.checkPassword returns a promise this .catch() can be shared
}