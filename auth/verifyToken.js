const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    const {token} = req.body

    if(!token || token === '') {
        req.session.messageVerifyToken = 'Please login by clicking on the link in your email'
        req.session.verify = false
        return next()
    }

    const {JWT_SECRET} = process.env
    jwt.verify(token, JWT_SECRET, (err, data) => {
        if(err) {
            req.session.messageVerifyToken = 'Token is invalid or expired'
            req.session.verify = false
        }
        else {
            req.session.verify = true
        }
    })
    next()
}