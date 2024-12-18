# FYLz - File Sharing Platform 🔒

**FYLz** is a file-sharing platform designed for temporary file exchanges. Built using modern web technologies, it ensures that shared files are stored for only a fixed amount of time before being automatically deleted, maintaining privacy and security.

## 📁 About the Project
FYLz allows users to upload files, share access codes, and download files within a short time frame. Once a file is uploaded, it is stored securely in the database and automatically deleted after **5 minutes** to ensure sensitive data isn't retained longer than necessary.

## 🚀 Features
- **File Uploading**: Users can upload files through a simple and intuitive interface.
- **Temporary Storage**: Files are stored securely in the database and automatically deleted after 5 minutes.
- **Access Codes**: Each file is assigned an access code to be shared with others for download.
- **Secure Data Handling**: All files are handled securely using Node.js and Multer.
  
## 🛠️ Tech Stack

- **Frontend**: React.js (for robust state management)
- **Backend**: Node.js and Express.js
- **File Handling**: Multer (for handling multipart data)
- **Database**: MongoDB (to store file metadata and access codes)


## 🌟 Key Features
- **Secure File Handling**: Files are securely uploaded and stored using Multer and MongoDB.
- **Time-Sensitive Data**: Files expire and are removed from the database after 5 minutes.
- **Simple Sharing**: Share an access code with others to allow them to download the file within the time frame.

## 🔒 Security
- **Data Expiry**: File data is stored in the MongoDB database for only 5 minutes after the upload.
- **Access Control**: Each file is associated with a unique access code that must be shared with others to allow access.

## 💬 Feedback
If you have any feedback or encounter issues, feel free to open an issue or contact us at `FYLz@gmail.com`.

