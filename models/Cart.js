const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CartSchema = new Schema({
    employeeName: String,
    productBarcode: String,
    productName: String,
    price: Number,
    quantity: Number,
    totalPrice: Number,
    url_image: String
})

module.exports = mongoose.model('Cart', CartSchema)

// employeeName, productBarcode, productName, price, quantity, totalPrice