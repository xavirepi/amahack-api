const createError = require('http-errors')
const jwt = require('jsonwebtoken')
const User = require('../models/User.model')

module.exports.create = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        // Error if email is already in the database
        next(createError(400, { errors: { email: 'This email is already in use' } }))
      } else {
        // User creation
        return User.create(req.body)
          .then(user => res.status(201).json(user))
      }
    })
    .catch(next)
}

module.exports.get = (req, res, next) => {
  User.findById(req.currentUser)
    .then(user => {
      if (!user) {
        next(createError(404))
      } else {
        res.json(user)
      }
    })
}

module.exports.authenticate = (req, res, next) => {
  const { email, password } = req.body

  User.findOne({ email })
    .then(user => {
      if (!user) {
        // Error if no user
        next(createError(404, { errors: { email: 'Email or password is incorrect' }}))
      } else {
        return user.checkPassword(password)
          .then(match => {
            if (!match) {
              //Error if no password
              next(createError(404, { errors: { email: 'Email or password is incorrect' }}))
            } else {
              // JWT generation - only id is passed
              res.json({ 
                access_token: jwt.sign(
                  { id: user._id },
                  process.env.JWT_SECRET || 'changeme',
                  {
                    expiresIn: '1d'
                  }
                )
               })
            }
          })
      }
    })
}
