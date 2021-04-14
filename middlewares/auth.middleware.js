// Passport used to send a req.isAuthenticated. Using JWT we have to validate tokens
const jwt = require('jsonwebtoken')
const createError = require('http-errors')

module.exports.isAuthenticated = (req, res, next) => {
    // Get Authorization header
    const authHeader = req.header('Authorization') // We get the header in Express using req.header and passing the string we want

    if (authHeader) { // We must check whether the header has arrived
        // Check auth protocol (Bearer)
        const authProtocol = authHeader.split(' ')[0] // This should be Bearer (log authHeader example: Bearer XXXXXX)

        if (authProtocol === 'Bearer') {
            // Token verification - If verification fails JWT library will throw an exception (which will be handled later on)
            jwt.verify( // JWT library method
                authHeader.split(' ')[1] || '', // The second position of authHeader.split(' ') is the actual token. If we don't have anything we add || '' so the library can throw an error
                process.env.JWT_SECRET,
                (error, decoded) => { // Callback that either fails or returns the payload (decoded)
                    if (error) {
                        next(error) // Errors middlewares will handle the error
                    }

                    if (decoded) {
                        req.currentUser = decoded.id // In the requests where the user must be authenticated we just run this middleware that decodes the token and returns the payload. In this case the user id, which was what we added to the payload when the access token was signed.
                        next()
                    }
                }
            )

        } else {
            next(createError(401)) // Again unauthorized error if the client is trying to use a different auth protocol from Bearer
        }

    } else {
        next(createError(401)) // We must send unauthorized error in case there's no header (https://developer.mozilla.org/es/docs/Web/HTTP/Status/401)
    }
}