import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { BiUpload, BiDownload, BiCopy } from "react-icons/bi";

const hashCode = async (code) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomChars = "";
  for (let i = 0; i < 3; i++) {
    randomChars += characters.charAt(
      Math.floor(Math.random() * characters.length),
    );
  }
  return code + randomChars;
};

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const [file, setFile] = useState(null);
  const [code, setCode] = useState("");
  const [hashedCode, setHashedCode] = useState("");
  const [receiverCode, setReceiverCode] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [receiveProgress, setReceiveProgress] = useState(0);
  const [receivedFile, setReceivedFile] = useState(null);
  const [receivedText, setReceivedText] = useState(null);
  const [uploadAlertMessage, setUploadAlertMessage] = useState("");
  // const [receiveAlertMessage, setReceiveAlertMessage] = useState("");
  const [sharableCode, setSharableCode] = useState(null);
  const [textContent, setTextContent] = useState("");
  const fileInputRef = useRef(null);

  const [isCodeVisible, setIsCodeVisible] = useState(false);

  useEffect(() => {
    // Hash the code whenever it changes
    if (code) {
      hashCode(code).then(setHashedCode);
    }
  }, [code]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file || !hashedCode) {
      setUploadAlertMessage("Please select a file and enter a code.");
      setIsCodeVisible(true);

      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("code", hashedCode); // Use hashed code for the upload

    try {
      await axios.post("http://localhost:5000/file-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setUploadProgress(percentCompleted);
        },
      });
      setUploadAlertMessage("File uploaded successfully!");
      setSharableCode(hashedCode); // Update sharable code after successful upload
    } catch (error) {
      setUploadAlertMessage("Error uploading file. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleTextUpload = async (e) => {
    e.preventDefault();

    if (!textContent || !hashedCode) {
      setUploadAlertMessage("Please enter text and a code.");
      if (!hashedCode) {
        // const randomCode = generateRandomCode();
        // setCode(randomCode);
        // setSharableCode(randomCode);
      }
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    try {
      await axios.post(
        "http://localhost:5000/text-upload",
        { textCode: hashedCode, userText: textContent }, // Use hashed code for the upload
        {
          headers: { "Content-Type": "application/json" },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setUploadProgress(percentCompleted);
          },
        },
      );
      setUploadAlertMessage("Text uploaded successfully!");
      setSharableCode(hashedCode); // Update sharable code after successful upload
    } catch (error) {
      setUploadAlertMessage("Error uploading text. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleReceive = async (e) => {
    e.preventDefault();
    if (!receiverCode) {
      setReceiveAlertMessage("Please enter a receiver code.");
      return;
    }

    setIsReceiving(true);
    setReceiveProgress(0);
    try {
      const response = await axios.post(
        "http://localhost:5000/file-get",
        { receiverCode },
        {
          onDownloadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setReceiveProgress(percentCompleted);
          },
        },
      );

      if (response.data.status === "ok") {
        if (response.data.type === "file") {
          setReceivedFile({
            fileName: response.data.data.fileName,
            url: `http://localhost:5000/my-files/${response.data.data.fileName}`,
          });
        } else if (response.data.type === "text") {
          setReceivedText(response.data.data.userText);
        }
        setReceiveAlertMessage("Content received successfully!");
      } else {
        setReceiveAlertMessage("No content found with this code.");
      }
    } catch (error) {
      setReceiveAlertMessage("Error receiving content. Please try again.");
    } finally {
      setIsReceiving(false);
      setReceiveProgress(0);
    }
  };

  const handleDownload = () => {
    if (receivedFile) {
      window.open(receivedFile.url, "_blank", "noreferrer");
    }
  };

  const handleCopyCode = () => {
    if (sharableCode) {
      navigator.clipboard.writeText(sharableCode).then(
        () => {
          setUploadAlertMessage("Code copied to clipboard!");
          setTimeout(() => {
            setUploadAlertMessage("");
          }, 3000);
        },
        (err) => {
          console.error("Could not copy text: ", err);
        },
      );
    }
  };

  const handleReceivedTextCopy = () => {
    if (receivedText) {
      navigator.clipboard.writeText(receivedText).then(
        () => {
          setUploadAlertMessage("Text copied to clipboard!");
          setTimeout(() => {
            setUploadAlertMessage("");
          }, 3000);
        },
        (err) => {
          console.error("Could not copy text: ", err);
        },
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center px-4">
      <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <h1 className="text-4xl font-bold text-center text-white mb-8">
          Welcome to FYLz
        </h1>

        <div className="flex mb-6">
          <button
            className={`flex-1 py-2 rounded-l-full transition-colors duration-300 ${
              activeTab === "upload"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab("upload")}
          >
            Upload
          </button>
          <button
            className={`flex-1 py-2 transition-colors duration-300 ${
              activeTab === "receive"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab("receive")}
          >
            Receive
          </button>
          <button
            className={`flex-1 py-2 rounded-r-full transition-colors duration-300 ${
              activeTab === "uploadText"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab("uploadText")}
          >
            UploadText
          </button>
        </div>

        {/* Alert Messages */}
        {(activeTab === "upload" || activeTab === "uploadText") &&
          uploadAlertMessage && (
            <div
              className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded"
              role="alert"
            >
              <p>{uploadAlertMessage}</p>
            </div>
          )}

        {activeTab === "upload" && (
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="relative">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                aria-label="Choose file"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-full hover:bg-gray-200 transition-colors duration-300 flex items-center justify-center"
              >
                <BiUpload className="mr-2" aria-hidden="true" />
                <span>{file ? file.name : "Choose File"}</span>
              </button>
            </div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code"
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Enter code"
            />
            <button
              type="submit"
              disabled={isUploading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center"
            >
              {isUploading ? "Uploading..." : "Upload File"}
            </button>
            <div className="flex justify-center mt-3">
              <button
                onClick={handleCopyCode}
                className="text-black ml-3 bg-slate-50 rounded px-2 py-1 hover:bg-slate-200 transition-colors duration-300"
              >
                <BiCopy />
              </button>
            </div>
            {isUploading && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </form>
        )}

        {activeTab === "uploadText" && (
          <>
            <form onSubmit={handleTextUpload} className="space-y-4">
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Enter your text here"
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={6}
              />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter code"
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={isUploading}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center"
              >
                {isUploading ? "Uploading..." : "Upload Text"}
              </button>
              {isUploading && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
              {/* Copy button for sharable code */}
            </form>
            <div className="flex justify-center mt-3">
              <button
                onClick={handleCopyCode}
                className="text-black ml-3 bg-slate-50 rounded px-2 py-1 hover:bg-slate-200 transition-colors duration-300"
              >
                <BiCopy />
              </button>
            </div>
          </>
        )}

        {activeTab === "receive" && (
          <form onSubmit={handleReceive} className="space-y-4">
            <input
              type="text"
              value={receiverCode}
              onChange={(e) => setReceiverCode(e.target.value)}
              placeholder="Enter receiver code"
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isReceiving}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center"
            >
              {isReceiving ? "Receiving..." : "Receive"}
            </button>
            {isReceiving && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${receiveProgress}%` }}
                ></div>
              </div>
            )}
          </form>
        )}

        {/* Display received file or text */}
        {receivedFile && activeTab === "receive" && (
          <div className="mt-4 p-4 bg-white bg-opacity-20 rounded-lg">
            <p className="text-white mb-2">
              Received file: {receivedFile.fileName}
            </p>
            <button
              onClick={handleDownload}
              className="w-full bg-green-500 text-white py-2 px-4 rounded-full hover:bg-green-600 transition-colors duration-300 flex items-center justify-center"
            >
              <BiDownload className="mr-2" />
              Download File
            </button>
          </div>
        )}

        {receivedText && activeTab === "receive" && (
          <div className="mt-4 p-4 bg-white bg-opacity-20 rounded-lg">
            <p className="text-white mb-2">Received text:</p>
            <pre className="bg-gray-100 p-4  rounded-md text-sm">
              {receivedText}
            </pre>
            <button
              onClick={handleReceivedTextCopy}
              className="text-black mt-3 bg-slate-50 rounded px-2 py-1 hover:bg-slate-200 transition-colors duration-300"
            >
              <BiCopy />
            </button>
          </div>
        )}

        <div className="text-lg text-white flex justify-center">
          <h2>Code: {sharableCode}</h2>
          {/* {isCodeVisible && <h2>Code: {sharableCode}</h2>} */}
        </div>

        <p className="text-sm text-gray-300 mt-6 text-center">
          Files and texts are securely shared and automatically deleted after 5
          minutes.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
