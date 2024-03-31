const mongoose = require('mongoose')
const Schema = mongoose.Schema

const OrderSchema = new Schema({
    employeeName: String,
    customerPhone: String,
    customerName: String,
    customerAddress: String,
    totalQuantity: Number,
    totalPrice: Number,
    received: Number,
    refunds: Number,
    creation_date: String
})

module.exports = mongoose.model('Order', OrderSchema)

// employeeName, customerPhone, totalQuantity, totalPrice, received, refunds, creation_date