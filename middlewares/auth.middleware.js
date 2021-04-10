const jwt = require('jsonwebtoken')
const createError = require('http-errors')

module.exports.isAuthenticated = (req, res, next) => {
  // Get Authorization header
  const authHeader = req.header('Authorization')

  if (authHeader) {
    // Check protocol
    const authProtocol = authHeader.split(' ')[0]

    if (authProtocol === 'Bearer') {
      // Verify token - if not correct it will throw exception
      jwt.verify(
        authHeader ? authHeader.split(' ')[1] : '',
        process.env.JWT_SECRET,
        (error, decoded) => {
          if (error) {
            next(error)
          }
    
          if (decoded) {
            req.currentUser = decoded.id
            next(error)
          }
        }
      )
    } else {
      next(createError(401))
    }
  } else {
    next(createError(401))
  }
}