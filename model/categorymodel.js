const mongoose= require('mongoose');


const categorySchema= new mongoose.Schema({
    CategoryName: String,
    // CategoryDescription: String,
})


module.exports= mongoose.model('category',categorySchema);