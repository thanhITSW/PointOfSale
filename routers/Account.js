const express = require('express')
const Router = express.Router()
const multer = require('multer')
const isAdmin = require('../auth/isAdmin')
const path = require('path');

const upload = multer({
    dest: path.join(__dirname, '..', 'public', 'Image', 'avatars'),
    fileFilter: (req, file, callback) => {
        if (file.mimetype.startsWith('image/')) {
            callback(null, true)
        }
        else callback(null, false)
    }, limits: { fileSize: 500000 }
})

const Controller = require('../controller/Account')
const IsLogin = require('../validators/IsLogin')
const verifyToken = require('../auth/verifyToken')

Router.get('/login', Controller.login_UI)

Router.get('/logout', Controller.logout)

Router.post('/login', verifyToken, Controller.login_Submit)

Router.get('/list-employees', IsLogin, Controller.list_employess)

Router.get('/', IsLogin, Controller.get_all_employees)

Router.post('/add', isAdmin, upload.single('image'), Controller.add_employee)

Router.post('/edit', isAdmin, upload.single('image'), Controller.edit_employee)

Router.post('/delete', isAdmin, Controller.delete_employee)

Router.post('/delete-many', isAdmin, upload.none(), Controller.delete_many_employee)

Router.post('/lock-unlock', isAdmin, upload.none(), Controller.lock_and_unlock_employee)

Router.post('/resend-email', isAdmin, upload.none(), Controller.resend_email)

Router.post('/change-password', IsLogin, Controller.change_password)

Router.post('/update-information', IsLogin, upload.single('image'), Controller.update_information)

Router.post('/change-password-first-login', upload.none(), Controller.change_password_first_login)


module.exports = Router