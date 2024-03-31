const express = require('express')
const Router = express.Router()
const multer = require('multer')
const path = require('path');

const upload = multer({
    dest: path.join(__dirname, '..', 'public', 'Image', 'products'),
    fileFilter: (req, file, callback) => {
        if (file.mimetype.startsWith('image/')) {
            callback(null, true)
        }
        else callback(null, false)
    }, limits: { fileSize: 500000 }
})

const Controller = require('../controller/Order')
const IsLogin = require('../validators/IsLogin')

Router.post('/add', IsLogin, upload.none(), Controller.add_order)

Router.post('/history-customer', IsLogin, Controller.history_customer)

Router.post('/details', IsLogin, upload.none(), Controller.details)

Router.post('/report', IsLogin, upload.none(), Controller.report)

module.exports = Router