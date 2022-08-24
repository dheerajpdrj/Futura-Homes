const mongoose = require('mongoose')


const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },

    cartItems: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "addproduct",
            },
            quantity: {
                type: Number,
            }
        }
    ]


})


module.exports = mongoose.model('cart', cartSchema);