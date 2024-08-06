const mongoose = require('mongoose')

const textSchema = new mongoose.Schema({
    textCode: String,
    userText: String
})

const textModel = new mongoose.model("text", textSchema)
module.exports = textModel;