const mongoose= require('mongoose');

const couponSchema= new mongoose.Schema({
    Couponname: String,
    Couponcode: String,
    Coupondescription: String,
    Coupondiscount: String,
    userId:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'users'
        }
        ]
})

module.exports= mongoose.model('coupon',couponSchema);