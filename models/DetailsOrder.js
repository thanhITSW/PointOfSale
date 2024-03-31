const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DetailsOrderSchema = new Schema({
    orderId: String,
    productBarcode: String,
    productName: String,
    price: Number,
    quantity: Number,
    totalPrice: Number
})

module.exports = mongoose.model('DetailsOrder', DetailsOrderSchema)

// orderId, productBarcode, productName, price, quantity, totalPrice