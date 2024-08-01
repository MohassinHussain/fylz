const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    email: String,
    query: String
})

const userModel = new mongoose.model("User", userSchema)
module.exports = userModel;