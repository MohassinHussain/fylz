const mongoose = require('mongoose')

const fileSchema = new mongoose.Schema({
  code: { type: String, required: true },
  sender: { type: String, required: true },
  recipient: { type: String, default: null },
  fileNames: [{ type: String, required: true }],
  expiresAt: { type: Date, default: Date.now, expires: 240 },
}, { timestamps: true });

const fileModel = mongoose.model("File", fileSchema)
module.exports = fileModel;
