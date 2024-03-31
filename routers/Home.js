const express = require('express')
const Router = express.Router()
const multer = require('multer')
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

const HomeController = require('../controller/Home')
const ProductController = require('../controller/Product')
const IsLogin = require('../validators/IsLogin')

Router.get('/', IsLogin, ProductController.display_products)

Router.post('/search-products', IsLogin, upload.none(), ProductController.search_products)

Router.get('/recent-order', IsLogin, HomeController.dashboard)

Router.get('/information', IsLogin, HomeController.information)

Router.get('/recent-order/bill', IsLogin, HomeController.downloadBill)

module.exports = Router