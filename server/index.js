require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cluster = require("cluster");
const os = require("os");
const cpu = os.cpus().length;
const archiver = require("archiver")
// const fs = require("fs")
// const compression = require('compression');

const fileModel = require("./Schemas/FileSchema");
const userModel = require("./Schemas/UserSchema");
const textModel = require("./TextSchema");

const port = "5000" || "8000";
const app = express();

// Middleware
app.use(cors());
// app.use(compression());
// app.use("/my-files", express.static("my-files", { maxAge: "1h" })); // Cacheinf the static files for 1 hour

app.use(
  "/my-files",
  express.static(path.join(__dirname, "my-files"), { maxAge: "1h" })
);


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Root Route
app.get("/", (req, res) => {
  res.send("HELLO");
});

mongoose
  .connect(process.env.MONGO_STRING)
  .then(() => {
    // console.log("Connected to MongoDB");

    if (cluster.isPrimary) {
      for (let i = 0; i < cpu; i++) {
        cluster.fork();
      }
    } else {
      app.listen(port, () => {
        // console.log(`Listening on port ${port}`);
        // console.log(cpu);
      });
    }
  })
  .catch((e) => console.log(e));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./my-files");
  },
  filename: function (req, file, cb) {
    const now = new Date();
    const uniqueSuffix = `${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

// Multer Upload with File Size Limit
// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 200 * 1024 * 1024 }, // 10MB file size limit
// });

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 200MB per file
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
    //   console.log("File deleted successfully.");
  } catch (err) {
    //   console.error("Error deleting file:", err);
  }
}

// File Upload Route
// app.post("/file-upload", upload.single("file"), async (req, res) => {
//   const code = req.body.code;
//   const fileName = req.file.filename;
//   // console.log("File Upload:", code, fileName);

//   // Send response immediately
//   res.send("FILE UPLOADED SUCCESSFULLY");

//   try {
//     await fileModel.create({ code, fileName });
//     // console.log("File stored in the database.");

//     // Delay file deletion by 4 minutes (240000 ms)
//     setTimeout(async () => {
//       try {
//         const filePath = path.join(__dirname, "my-files", fileName);
//         //   console.log("Deleting file:", filePath);
//         await deleteFile(filePath);

//         await fileModel.deleteMany({ code });
//         //   console.log("Deleted record from database:", code);
//       } catch (err) {
//         console.error("Error during delayed deletion:", err);
//       }
//     }, 240000);
//   } catch (error) {
//     // console.error("Error uploading file to database:", error);
//   }
// });


app.post("/file-upload", upload.array("files", 10), async (req, res) => {
  const code = req.body.code;
  const fileNames = req.files.map((f) => f.filename); // store all filenames

  res.send("FILES UPLOADED SUCCESSFULLY");

  try {
    await fileModel.create({ code, fileNames });

    // Delete after 4 minutes
    setTimeout(async () => {
      try {
        for (let fileName of fileNames) {
          const filePath = path.join(__dirname, "my-files", fileName);
          await deleteFile(filePath);
        }
        await fileModel.deleteMany({ code });
      } catch (err) {
        console.error("Error during delayed deletion:", err);
      }
    }, 240000);
  } catch (error) {
    console.error("Error uploading files to database:", error);
  }
});

// app.post("/file-get", async (req, res) => {
//   const { receiverCode } = req.body;

//   try {
//     const document = await fileModel.findOne({ code: receiverCode });

//     if (document) {
//       res.send({ status: "ok", type: "file", data: document });
//     } else {
//       const textDoc = await textModel.findOne({ textCode: receiverCode });

//       if (textDoc) {
//         res.send({ status: "ok", type: "text", data: textDoc });
//       } else {
//         res.status(404).send({
//           status: "error",
//           message: "No file or text found with this code",
//         });
//       }
//     }
//   } catch (error) {
//     console.error("Error retrieving document:", error);
//     res
//       .status(500)
//       .send({ status: "error", message: "Server error while retrieving data" });
//   }
// });

// Text Upload Route

// app.post("/file-get", async (req, res) => {
//   const { receiverCode } = req.body;
//   const fileDoc = await fileModel.findOne({ code: receiverCode });

//   if (!fileDoc) {
//     return res.json({ status: "error", message: "No file found" });
//   }

//   res.json({
//     status: "ok",
//     type: "file",
//     data: {
//       fileNames: fileDoc.fileNames, // <-- array of strings
//     },
//   });
// });

app.post("/file-get", async (req, res) => {
  const { receiverCode } = req.body;

  try {
    // First check in fileModel
    const fileDoc = await fileModel.findOne({ code: receiverCode });

    if (fileDoc) {
      return res.json({
        status: "ok",
        type: "file",
        data: {
          fileNames: fileDoc.fileNames, // array of strings
        },
      });
    }

    // If no file, check in textModel
    const textDoc = await textModel.findOne({ textCode: receiverCode });
    if (textDoc) {
      return res.json({
        status: "ok",
        type: "text",
        data: {
          userText: textDoc.userText,
        },
      });
    }

    // If neither found
    res.status(404).json({
      status: "error",
      message: "No file or text found with this code",
    });
  } catch (error) {
    console.error("Error retrieving document:", error);
    res.status(500).json({
      status: "error",
      message: "Server error while retrieving data",
    });
  }
});


app.get("/download-all/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const fileDoc = await fileModel.findOne({ code });

    if (!fileDoc || !fileDoc.fileNames || fileDoc.fileNames.length === 0) {
      return res.status(404).json({ message: "No files found" });
    }

    // Set headers
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=files_${code}.zip`
    );

    const archive = archiver("zip", { zlib: { level: 9 } });

    // Pipe archive data to response
    archive.pipe(res);

    // Append files one by one
    fileDoc.fileNames.forEach((fileName) => {
      const filePath = path.join(__dirname, "uploads", fileName);
      if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: fileName });
      }
    });

    // Finalize archive (VERY IMPORTANT ⚡️)
    archive.finalize();

    // Handle errors
    archive.on("error", (err) => {
      console.error("Archive error:", err);
      res.status(500).send({ error: "Error creating archive" });
    });
  } catch (err) {
    console.error("Download all error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.post("/text-upload", async (req, res) => {
  const { textCode, userText } = req.body;
  // console.log("Text Upload:", textCode, userText);

  try {
    await textModel.create({ textCode, userText });
    // console.log("Text stored in the database.");
    res.send("Text uploaded to the database");

    // Delay text deletion by 4 minutes (240000 ms)
    setTimeout(async () => {
      await textModel.deleteMany({ textCode });
      // console.log(`Deleted text with code ${textCode} from the database.`);
    }, 240000);
  } catch (error) {
    // console.error("Error uploading text to the database:", error);
    res.status(500).send("Failed to upload text");
  }
});