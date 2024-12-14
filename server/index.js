require('dotenv').config();
const express = require("express");
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const cluster = require('cluster');
const os = require('os');
const cpu = os.cpus().length

// const compression = require('compression');

const fileModel = require('./Schemas/FileSchema');
const userModel = require('./Schemas/UserSchema');
const textModel = require('./TextSchema');

const port = '5000' || '8000';
const app = express();

// Middleware
app.use(cors());
// app.use(compression()); 
app.use('/my-files', express.static("my-files", { maxAge: '1h' })); // Cache static files for 1 hour
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Root Route
app.get('/', (req, res) => {
    res.send("HELLO");
});

// MongoDB Connection with Pooling
mongoose.connect("mongodb+srv://userme:OhguQudhETIKckYQ@cluster0.hwpdi97.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0").then(() => {
    console.log("Connected to MongoDB");
    
if(cluster.isPrimary) {
    for(let i = 0; i<cpu; i++) {
        cluster.fork();
    }
} 
else {

    app.listen(port, () => {
        console.log(`Listening on port ${port}`);
        // console.log(cpu);

    });
}
}).catch(e => console.log(e));

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './my-files');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, uniqueSuffix + "-" + file.originalname);
    }
});

// Multer Upload with File Size Limit
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB file size limit
});

// Utility for Deleting Files
// const deleteFile = (filePath) => new Promise((resolve, reject) => {
//     fs.unlink(filePath, (err) => {
//         if (err) return reject(err);
//         resolve();
//     });
// });
async function deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      console.log("File deleted successfully.");
    } catch (err) {
      console.error("Error deleting file:", err);
    }
  }

// File Upload Route
app.post('/file-upload', upload.single("file"), async (req, res) => {
    const code = req.body.code;
    const fileName = req.file.filename;
    console.log("File Upload:", code, fileName);

    // Send response immediately
    res.send("FILE UPLOADED SUCCESSFULLY");

    try {
        await fileModel.create({ code, fileName });
        console.log("File stored in the database.");

        // Delay file deletion by 4 minutes (240000 ms)
        setTimeout(async () => {
            try {
              const filePath = path.join(__dirname, "my-files", fileName);
              console.log("Deleting file:", filePath);
              await deleteFile(filePath);
          
              await fileModel.deleteMany({ code });
              console.log("Deleted record from database:", code);
            } catch (err) {
              console.error("Error during delayed deletion:", err);
            }
          }, 240000);
    } catch (error) {
        console.error("Error uploading file to database:", error);
    }
});

// File Retrieval Route
app.post('/file-get', async (req, res) => {
    const { receiverCode } = req.body;
    console.log("Receiver Code:", receiverCode);

    try {
        const document = await fileModel.findOne({ code: receiverCode });
        if (document) {
            console.log("File document found:", document);
            res.send({ status: "ok", data: document });
        } else {
            const textDoc = await textModel.findOne({ textCode: receiverCode });
            if (textDoc) {
                console.log("Text document found:", textDoc);
                res.send({ status: "ok", data: textDoc });
            } else {
                console.log("No document or text found");
                res.status(404).send({ status: "error", data: "No document or text found" });
            }
        }
    } catch (error) {
        console.error("Error retrieving document:", error);
        res.status(500).send({ status: "error", data: "Server error" });
    }
});

// Footer API for storing user queries
app.post('/footer', async (req, res) => {
    const { email, query } = req.body;
    try {
        await userModel.create({ email, query });
        res.send({ status: "OK", data: "Footer data uploaded to the database" });
    } catch (error) {
        console.error("Error uploading footer data to MongoDB:", error);
        res.status(500).send("Failed to upload footer data");
    }
});

// Text Upload Route
app.post("/text-upload", async (req, res) => {
    const { textCode, userText } = req.body;
    console.log("Text Upload:", textCode, userText);

    try {
        await textModel.create({ textCode, userText });
        console.log("Text stored in the database.");
        res.send("Text uploaded to the database");

        // Delay text deletion by 4 minutes (240000 ms)
        setTimeout(async () => {
            await textModel.deleteMany({ textCode });
            console.log(`Deleted text with code ${textCode} from the database.`);
        }, 240000);
    } catch (error) {
        console.error("Error uploading text to the database:", error);
        res.status(500).send("Failed to upload text");
    }
});