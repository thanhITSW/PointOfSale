module.exports = (req, res, next) => {

    if(req.session.user.role !== 'admin') {
        return res.json({code: 2, message: 'You do not have access'})
    }
    
    next()
}