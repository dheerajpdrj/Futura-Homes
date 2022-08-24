let mongoose = require('mongoose')

const adminShema = new mongoose.Schema({
    name: {
        type: String,
        default:'Dheeraj'
    },
    email: String,
    password: String
})

module.exports = mongoose.model('admin', adminShema)