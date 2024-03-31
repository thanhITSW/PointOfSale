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

const Controller = require('../controller/Customer')
const IsLogin = require('../validators/IsLogin')

Router.post('/search', IsLogin, upload.none(), Controller.search)

module.exports = Router