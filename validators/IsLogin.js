module.exports = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/accounts/login')
    }
    
    if(req.session.user.isFirst === true) {
        return res.render('FirstLogin', { user: req.session.user })
    }

    next()
}