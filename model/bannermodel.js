const mongoose= require('mongoose');


let bannerSchema= new mongoose.Schema({
    Product:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'addproduct'
    },
    Heading:String,
    Description:String,
})


module.exports= mongoose.model('banner',bannerSchema)