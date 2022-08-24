const mongoose= require('mongoose')


const addressSchema= new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    },
    name:String,
    number: Number,
    address1: String,
    address2:String,
    district: String,
    state: String,
    country:String,
    pincode: Number
})

module.exports= mongoose.model('address',addressSchema)