const mongoose= require('mongoose')


const wishlistSchema=  new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    },

    wishlistItems:[
        
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:'addproduct'
            }
        
    ]
})

module.exports= mongoose.model('wishlist',wishlistSchema);