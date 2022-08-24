const mongoose= require('mongoose');

const orderschema= new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'users'
    },
    Orderitems:[
        {
            product:{
                type: mongoose.Schema.Types.ObjectId,
                ref:'addproduct'
            },
            quantity:{
                type:Number
            }
        }
    ],
    Totalprice: Number,
    Deliverycharge:Number,
    Deliverydetails:  {
            type:mongoose.Schema.Types.ObjectId,
            ref:'address'
    },
    Paymentdetails:String,
    Orderstatus:Boolean,
    Deliverystatus:String
},
{
    timestamps:true
})

module.exports= mongoose.model('order',orderschema);