const mongoose= require('mongoose')


let addProductSchema=new mongoose.Schema({
    Name: String,
    Stock: String,
    Price: String,
    DiscountedPrice: String,
    Category:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category'
    },
    Description: String
},
{
    timestamps:true
}) 


module.exports= mongoose.model('addproduct',addProductSchema)