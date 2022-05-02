const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
   title : String,
   ISBN : String,
   stock : Number,
   author : String,
   category : String,
});

module.exports =  mongoose.model("Book", bookSchema);