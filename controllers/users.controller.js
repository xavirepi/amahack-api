const createError = require('http-errors')
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
