const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CustomerSchema = new Schema({
    name: String,
    phone: { type: Number, unique: true },
    address: String
})

module.exports = mongoose.model('Customer', CustomerSchema)

// name, phone, address