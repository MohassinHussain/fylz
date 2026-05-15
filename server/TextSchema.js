const mongoose = require('mongoose')

const textSchema = new mongoose.Schema({
    textCode: { type: String, required: true },
    sender: { type: String, required: true },
    recipient: { type: String, default: null },
    userText: { type: String, required: true },
    expiresAt: { type: Date, default: Date.now, expires: 240 },
}, { timestamps: true });

const textModel = mongoose.model("text", textSchema)
module.exports = textModel;
