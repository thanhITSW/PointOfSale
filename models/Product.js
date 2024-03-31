const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ProductSchema = new Schema({
    barcode: { type: String, unique: true },
    name: { type: String, unique: true },
    import_price: Number,
    retail_price: Number,
    category: String,
    creation_date: String,
    url_image: String
})

module.exports = mongoose.model('Product', ProductSchema)

//barcode, name, import price, retail price, category, creation date, url_image