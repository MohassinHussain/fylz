require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const compression = require("compression");
const multer = require("multer");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");

const fileModel = require("./Schemas/FileSchema");
const textModel = require("./TextSchema");
const userModel = require("./Schemas/UserSchema");

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";
const JWT_SECRET = process.env.JWT_SECRET || "fylz-secret-change-in-production";
const JWT_EXPIRY = "1h";

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname, "my-files");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Security headers
app.use(helmet());
app.use(compression());

// CORS
const CORS_ORIGINS = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || CORS_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many auth attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many upload requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// Static files
app.use(
  "/my-files",
  express.static(UPLOAD_DIR, {
    maxAge: "1h",
    etag: true,
    lastModified: true,
  })
);

// MongoDB connection
const MONGO_OPTIONS = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
};

mongoose
  .connect(process.env.MONGO_STRING, MONGO_OPTIONS)
  .then(async () => {
    await ensureIndexes();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

async function ensureIndexes() {
  try {
    await userModel.collection.createIndex({ username: 1 }, { unique: true });
    await fileModel.collection.createIndex({ code: 1 });
    await fileModel.collection.createIndex({ sender: 1 });
    await fileModel.collection.createIndex({ recipient: 1 });
    await textModel.collection.createIndex({ textCode: 1 });
    await textModel.collection.createIndex({ sender: 1 });
    await textModel.collection.createIndex({ recipient: 1 });
    console.log("MongoDB indexes created");
  } catch (err) {
    console.error("Index creation error:", err);
  }
}

// JWT Auth Middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Session expired", expired: true });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

app.get("/", (req, res) => {
  res.send("FYLz API is running");
});

// Auth: Login or Register
app.post("/user/auth", authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || username.trim().length < 2) {
      return res.status(400).json({ error: "Username must be at least 2 characters" });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const cleanUsername = username.trim().toLowerCase();
    const existing = await userModel.findOne({ username: cleanUsername });

    let user;
    let isNewUser = false;

    if (existing) {
      const match = await bcrypt.compare(password, existing.password);
      if (!match) {
        return res.status(401).json({ error: "Incorrect password" });
      }
      user = existing;
    } else {
      const hashed = await bcrypt.hash(password, 10);
      user = await userModel.create({ username: cleanUsername, password: hashed });
      isNewUser = true;
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    res.json({
      token,
      username: user.username,
      isNewUser,
    });
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(500).json({ error: "Authentication failed" });
  }
});

// User Search (authenticated)
app.get("/user/search", authenticate, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 1) {
      return res.json([]);
    }
    const users = await userModel
      .find({ username: { $regex: q.trim().toLowerCase(), $options: "i" } })
      .select("username")
      .limit(10)
      .lean();
    res.json(users.map((u) => u.username).filter((u) => u !== req.user.username));
  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({ error: "Search failed" });
  }
});

// Get pending shares (authenticated)
app.get("/shares", authenticate, async (req, res) => {
  try {
    const username = req.user.username;
    const files = await fileModel
      .find({ recipient: username })
      .select("code sender fileNames createdAt")
      .sort({ createdAt: -1 })
      .lean();
    const texts = await textModel
      .find({ recipient: username })
      .select("textCode sender createdAt")
      .sort({ createdAt: -1 })
      .lean();
    res.json({
      files: files.map((f) => ({
        code: f.code,
        sender: f.sender,
        fileCount: f.fileNames.length,
        createdAt: f.createdAt,
      })),
      texts: texts.map((t) => ({
        code: t.textCode,
        sender: t.sender,
        createdAt: t.createdAt,
      })),
    });
  } catch (error) {
    console.error("Shares fetch error:", error.message);
    res.status(500).json({ error: "Failed to fetch shares" });
  }
});

// Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const uniqueSuffix = `${timestamp}-${Math.random().toString(36).slice(2, 8)}`;
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, cb) => {
    if (file.size === 0) return cb(new Error("Empty file"));
    cb(null, true);
  },
});

async function deleteFile(filePath) {
  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.error(`Failed to delete ${filePath}:`, err.message);
    }
  }
}

// File Upload (authenticated)
app.post("/file-upload", authenticate, uploadLimiter, upload.array("files", 10), async (req, res) => {
  try {
    const { code, recipient } = req.body;
    const fileNames = req.files.map((f) => f.filename);

    res.send("FILES UPLOADED SUCCESSFULLY");

    await fileModel.create({
      code,
      sender: req.user.username,
      recipient: recipient || null,
      fileNames,
    });

    setTimeout(async () => {
      try {
        for (const fileName of fileNames) {
          await deleteFile(path.join(UPLOAD_DIR, fileName));
        }
        await fileModel.deleteMany({ code });
      } catch (err) {
        console.error("Cleanup error:", err.message);
      }
    }, 240000);
  } catch (error) {
    console.error("File upload error:", error.message);
    res.status(500).json({ error: "Failed to upload files" });
  }
});

// Multer error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "File too large. Max 20MB per file." });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ error: "Too many files. Max 10 files." });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(500).json({ error: err.message });
  }
  next();
});

// File/Text Retrieval (authenticated)
app.post("/file-get", authenticate, async (req, res) => {
  try {
    const { receiverCode } = req.body;
    if (!receiverCode) {
      return res.status(400).json({ status: "error", message: "Code is required" });
    }

    const fileDoc = await fileModel.findOne({ code: receiverCode }).lean();
    if (fileDoc) {
      return res.json({
        status: "ok",
        type: "file",
        data: { fileNames: fileDoc.fileNames },
      });
    }

    const textDoc = await textModel.findOne({ textCode: receiverCode }).lean();
    if (textDoc) {
      return res.json({
        status: "ok",
        type: "text",
        data: { userText: textDoc.userText },
      });
    }

    res.status(404).json({
      status: "error",
      message: "No file or text found with this code",
    });
  } catch (error) {
    console.error("Retrieval error:", error.message);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Download All as ZIP (authenticated)
app.get("/download-all/:code", authenticate, async (req, res) => {
  try {
    const { code } = req.params;
    const fileDoc = await fileModel.findOne({ code }).lean();

    if (!fileDoc || !fileDoc.fileNames || fileDoc.fileNames.length === 0) {
      return res.status(404).json({ message: "No files found" });
    }

    const archive = archiver("zip", { zlib: { level: 6 } });

    let totalSize = 0;
    let filesAdded = 0;

    for (const fileName of fileDoc.fileNames) {
      const filePath = path.join(UPLOAD_DIR, fileName);
      try {
        const stat = await fs.promises.stat(filePath);
        archive.file(filePath, { name: fileName });
        totalSize += stat.size;
        filesAdded++;
      } catch {
        console.log(`File not found: ${fileName}`);
      }
    }

    if (filesAdded === 0) {
      return res.status(404).json({ message: "No files found on disk" });
    }

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename=files_${code}.zip`);
    res.setHeader("Content-Length", totalSize * 1.1);

    archive.pipe(res);

    archive.on("error", (err) => {
      console.error("Archive error:", err.message);
      if (!res.headersSent) {
        res.status(500).json({ error: "Archive creation failed" });
      }
    });

    archive.on("end", () => {
      res.end();
    });

    archive.finalize();
  } catch (err) {
    console.error("Download error:", err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Text Upload (authenticated)
app.post("/text-upload", authenticate, uploadLimiter, async (req, res) => {
  try {
    const { textCode, userText, recipient } = req.body;

    if (!textCode || !userText) {
      return res.status(400).json({ error: "textCode and userText are required" });
    }

    await textModel.create({
      textCode,
      sender: req.user.username,
      recipient: recipient || null,
      userText,
    });
    res.send("Text uploaded to the database");

    setTimeout(async () => {
      try {
        await textModel.deleteMany({ textCode });
      } catch (err) {
        console.error("Text cleanup error:", err.message);
      }
    }, 240000);
  } catch (error) {
    console.error("Text upload error:", error.message);
    res.status(500).json({ error: "Failed to upload text" });
  }
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  await mongoose.connection.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received. Shutting down gracefully...");
  await mongoose.connection.close();
  process.exit(0);
});
