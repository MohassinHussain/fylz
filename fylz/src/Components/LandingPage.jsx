import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { BiUpload, BiDownload, BiCopy } from "react-icons/bi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const API_BASE = "https://fylz.onrender.com"; // later switch to process.env


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
  // const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
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

  // const [isCodeVisible, setIsCodeVisible] = useState(false);

  useEffect(() => {
    // Hash the code whenever it changes
    if (code) {
      hashCode(code).then(setHashedCode);
    }
  }, [code]);

  // const handleFileChange = (e) => {
  //   setFile(e.target.files[0]);
  // };
  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files)); // store as array
  };

  // const handleUpload = async (e) => {
  //   e.preventDefault();

  //   if (!file || !hashedCode) {
  //     setUploadAlertMessage("Please select a file and enter a code.");
  //     setIsCodeVisible(true);

  //     return;
  //   }

  //   setIsUploading(true);
  //   setUploadProgress(0);
  //   const formData = new FormData();
  //   formData.append("file", file);
  //   formData.append("code", hashedCode); // Use hashed code for the upload

  //   try {
  //     // await axios.post("https://fylz.onrender.com/file-upload", formData, {
  //     await axios.post("https://fylz.onrender.com/file-upload", formData, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //       onUploadProgress: (progressEvent) => {
  //         const percentCompleted = Math.round(
  //           (progressEvent.loaded * 100) / progressEvent.total,
  //         );
  //         setUploadProgress(percentCompleted);
  //       },
  //     });
  //     setUploadAlertMessage("File uploaded successfully!");
  //     setSharableCode(hashedCode); // Update sharable code after successful upload
  //   } catch (error) {
  //     setUploadAlertMessage("Error uploading file. Please try again.");
  //   } finally {
  //     setIsUploading(false);
  //     setUploadProgress(0);
  //   }
  // };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!files.length || !hashedCode) {
      setUploadAlertMessage("Please select at least one file and enter a code.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file); // field name must match backend
    });
    formData.append("code", hashedCode);

    try {
      await axios.post("https://fylz.onrender.com/file-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });
      setUploadAlertMessage("Files uploaded successfully!");
      setSharableCode(hashedCode);
    } catch (error) {
      setUploadAlertMessage("Error uploading files. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
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
        // "https://fylz.onrender.com/text-upload",
        "https://fylz.onrender.com/text-upload",
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
      // setReceiveAlertMessage("Please enter a receiver code.");
      return;
    }

    setIsReceiving(true);
    setReceiveProgress(0);
    try {
      const response = await axios.post(
        "https://fylz.onrender.com/file-get",
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
            fileNames: response.data.data.fileNames,  // <-- backend sends an array
          });
        } else if (response.data.type === "text") {
          setReceivedText(response.data.data.userText);
        }

        // setReceiveAlertMessage("Content received successfully!");
      } else {
        // setReceiveAlertMessage("No content found with this code.");
      }
    } catch (error) {
      // setReceiveAlertMessage("Error receiving content. Please try again.");
    } finally {
      setIsReceiving(false);
      setReceiveProgress(0);
    }
  };

  // const handleDownload = () => {
  //   if (receivedFile) {

  //     window.open(receivedFile.url, "_blank", "noreferrer");
  //   }
  // };

  const handleDownload = () => {
    if (receivedFile) {
      const link = document.createElement("a");
      link.href = receivedFile.url;
      link.download = receivedFile.name || "download"; // Set a filename (optional)
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  //   const handleDownloadAll = () => {
  //   if (receivedFile?.fileNames?.length > 0) {
  //     receivedFile.fileNames.forEach((fileName) => {
  //       const url = `${API_BASE}/my-files/${fileName}`;
  //       window.open(url, "_blank"); // opens each file in a new tab
  //     });
  //   }
  // };

  // const handleDownloadAll = () => {
  //   if (receiverCode) {
  //     const link = document.createElement("a");
  //     link.href = `${API_BASE}/download-all/${receiverCode}`;
  //     link.download = `files_${receiverCode}.zip`;
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   }
  // };

  const handleDownloadAll = () => {
    if (receiverCode) {
      const link = document.createElement("a");
      link.href = `${API_BASE}/download-all/${receiverCode}`;
      link.download = `files_${receiverCode}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
    <div className="min-h-screen  flex items-center justify-center px-4">
      <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <h1 className="text-4xl font-bold text-center text-white mb-8">
          Welcome to FYLz
        </h1>

        <div className="flex mb-6">
          <button
            className={`flex-1 py-2 rounded-l-full transition-colors duration-300 ${activeTab === "upload"
              ? "bg-gray-500 text-white"
              : "bg-gray-200 text-gray-700"
              }`}
            onClick={() => setActiveTab("upload")}
          >
            Upload
          </button>
          <button
            className={`flex-1 py-2 transition-colors duration-300 ${activeTab === "receive"
              ? "bg-gray-500 text-white"
              : "bg-gray-200 text-gray-700"
              }`}
            onClick={() => setActiveTab("receive")}
          >
            Receive
          </button>
          <button
            className={`flex-1 py-2 rounded-r-full transition-colors duration-300 ${activeTab === "uploadText"
              ? "bg-gray-500 text-white"
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
              className={`border-l-4 border-yellow-500 ${sharableCode ? "bg-green-200" : "bg-yellow-100"
                } text-yellow-700 p-4 mb-4 rounded`}
              role="alert"
            >
              <p>{uploadAlertMessage}</p>
            </div>
          )}

        {activeTab === "upload" && (
          <>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="relative">
                {/* <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  aria-label="Choose file"
                /> */}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple // <-- allow multiple files
                  className="hidden"
                  aria-label="Choose files"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-full hover:bg-gray-200 transition-colors duration-300 flex items-center justify-center"
                >
                  <BiUpload className="mr-2" aria-hidden="true" />
                  <span>
                    {files.length ? `${files.length} file(s) selected` : "Choose Files"}
                  </span>
                </button>

                {/* <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-full hover:bg-gray-200 transition-colors duration-300 flex items-center justify-center"
                >
                  <BiUpload className="mr-2" aria-hidden="true" />
                  <span>{file ? file.name : "Choose File"}</span>
                </button> */}
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
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-full hover:bg-gray-700 transition-colors duration-300 flex items-center justify-center"
              >
                {isUploading ? "Uploading..." : "Upload File"}
              </button>

              {isUploading && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
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

        {activeTab === "uploadText" && (
          <>
            <form onSubmit={handleTextUpload} className="space-y-4">
              {/* <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Enter your text here"
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={6}
              /> */}
              <textarea
                value={textContent}
                onChange={(e) => {
                  setTextContent(e.target.value);

                  // auto resize
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                placeholder="Enter your text here"
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={1}
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
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-full hover:bg-gray-700 transition-colors duration-300 flex items-center justify-center"
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
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-full hover:bg-gray-700 transition-colors duration-300 flex items-center justify-center"
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
        {/* {receivedFile && activeTab === "receive" && (
          <div className="mt-4 p-4 bg-white bg-opacity-20 rounded-lg">
            <p className="text-white mb-2">
              Received file: {receivedFile.fileName}
            </p>
            <button
              onClick={handleDownload}
              className="w-full bg-green-500 text-white py-2 px-4 rounded-full hover:bg-green-600 transition-colors duration-300 flex items-center justify-center"
            >
              <BiDownload className="mr-2" />
              View/ Download File
            </button>
          </div>
        )} */}


        {/* {receivedFile?.fileNames?.map((fileName, idx) => (
          
          <div key={idx} className="mt-4 p-4 bg-white bg-opacity-20 rounded-lg">
            <p className="text-white mb-2">Received</p>
            <button
              onClick={() => {
                const link = document.createElement("a");
                link.href = `https://fylz.onrender.com/my-files/${fileName}`;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="w-full bg-green-500 text-white py-2 px-4 rounded-full hover:bg-green-600 transition-colors duration-300 flex items-center justify-center"
            >
              <BiDownload className="mr-2" />
              {fileName}
            </button>
          </div>
        ))} */}


        {/* Files show ONLY in Receive tab */}
        {receivedFile?.fileNames?.length > 0 && (
          <div className="mt-4 p-4 bg-white bg-opacity-20 rounded-lg">
            <p className="text-white mb-2">Received files:</p>
            {receivedFile.fileNames.map((fileName, idx) => (
              <div key={idx} className="mb-2">
                <button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = `${API_BASE}/my-files/${fileName}`;
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-full hover:bg-green-600"
                >
                  <BiDownload className="mr-2 inline" />
                  {fileName}
                </button>
              </div>
            ))}

            {/* Download All */}
            {receivedFile.fileNames.length > 1 && (
              <button
                onClick={handleDownloadAll}
                className="mt-3 w-full bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600"
              >
                <BiDownload className="mr-2 inline" />
                Download All
              </button>
            )}
          </div>
        )}

       

        {receivedText && activeTab === "receive" && (
          
          <div className="mt-4 p-4 bg-white bg-opacity-20 rounded-lg">
            <p className="text-white mb-2">Received text:</p>

           <button
          onClick={handleReceivedTextCopy}
          className="text-black mt-3 bg-slate-50 rounded px-2 py-1 hover:bg-slate-200 transition-colors duration-300"
        >
          <BiCopy />
        </button>
            {/* <div className="bg-gray-100 p-4 rounded-md text-sm prose max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {receivedText}
              </ReactMarkdown>
            </div> */}

            <div className="bg-gray-100 p-4 rounded-md text-sm prose max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-gray-200 px-1 py-0.5 rounded" {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {receivedText}
              </ReactMarkdown>
            </div>



          </div>
        )}

        {/* {receivedText && activeTab === "receive" && (
          <div className="mt-4 p-4 bg-white bg-opacity-20 rounded-lg">
            <p className="text-white mb-2">Received text:</p>
            <pre className="bg-gray-100 p-4  rounded-md text-sm">
              {receivedText}
            </pre>

            <pre className="bg-gray-100 p-4 rounded-md text-sm whitespace-pre-wrap">
              {receivedText}
            </pre>
            <button
              onClick={handleReceivedTextCopy}
              className="text-black mt-3 bg-slate-50 rounded px-2 py-1 hover:bg-slate-200 transition-colors duration-300"
            >
              <BiCopy />
            </button>
          </div>
        )} */}

        {/* {receivedText && (
          <div className="mt-4 p-4 bg-white bg-opacity-20 rounded-lg">
            <p className="text-white mb-2">Received text:</p>
            <pre className="bg-gray-100 p-4 rounded-md text-sm">
              {receivedText}
            </pre>
            <button
              onClick={handleReceivedTextCopy}
              className="mt-3 text-black bg-slate-50 rounded px-2 py-1 hover:bg-slate-200"
            >
              <BiCopy />
            </button>
          </div>
        )} */}

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
