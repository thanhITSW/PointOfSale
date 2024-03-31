const express = require('express')
const Router = express.Router()

const Controller = require('../controller/Product')
const IsLogin = require('../validators/IsLogin')
const isAdmin = require('../auth/isAdmin')

Router.get('/', IsLogin, Controller.get_all_products)

Router.post('/add', isAdmin, Controller.add_product)

Router.post('/edit', isAdmin, Controller.edit_product)

Router.post('/delete', isAdmin, Controller.delete_product)

module.exports = Router