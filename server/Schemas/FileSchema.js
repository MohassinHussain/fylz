// const mongoose = require('mongoose')

// const fileSchema = new mongoose.Schema({
//     b64Strings:[String],
//     test: String    
// })

// const fileModel = new mongoose.model("File", fileSchema)
// module.exports = fileModel;

const mongoose = require('mongoose')

const fileSchema = new mongoose.Schema({
  code: String,
  fileNames: [String],
});

const fileModel = new mongoose.model("File", fileSchema)
module.exports = fileModel;


