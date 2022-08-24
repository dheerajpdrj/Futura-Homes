let mongoose= require('mongoose');

const userSchema= new mongoose.Schema({

    Fname:{
    type: String,
    // required: true
    } ,

    Lname: {
        type: String,
        // required: true
        },

    Email: {
        type: String,
        // required: true
        },

    Mobile: {
        type: Number,
        // required: true
        },

        AltMobile: Number,

    Password: {
        type: String,
        // required: true
        },
        status:{
            type: Boolean
        }

},

{
    timestamps:true
});

module.exports = User= mongoose.model('users', userSchema);