const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AccountSchema = new Schema({
    fullname: { type: String, unique: true },
    email: { type: String, unique: true },
    username: { type: String, unique: true },
    password: String,
    phone: String,
    role: String,
    isActive: Boolean,
    status: String,
    url_avatar: String,
    isFirst: Boolean
})

module.exports = mongoose.model('Account', AccountSchema)

//fullname, email, username, phone, role, isActive, status, url_avatar, isFirst