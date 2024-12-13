

import React, { useState, useRef } from 'react';
import axios from 'axios';
import { BiUpload, BiDownload, BiCopy } from 'react-icons/bi';

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [file, setFile] = useState(null);
  const [code, setCode] = useState('');
  const [receiverCode, setReceiverCode] = useState('');
  // const [alertMessage, setAlertMessage] = useState('');
  // const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [receiveProgress, setReceiveProgress] = useState(0);
  const [receivedFile, setReceivedFile] = useState(null);
  const [uploadAlertMessage, setUploadAlertMessage] = useState('');
  const [receiveAlertMessage, setReceiveAlertMessage] = useState('');
  const [sharableCode, setSharableCode] = useState(null); // Added state for sharable code
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !code) {
      setUploadAlertMessage("Please select a file and enter a code.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("code", code);

    try {
      const response = await axios.post(
        "https://fylz.onrender.com/file-upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          },
        }
      );
      setSharableCode(code); // Set sharable code after successful upload
      setUploadAlertMessage("File uploaded successfully!");
    } catch (error) {
      setUploadAlertMessage("Error uploading file. Please try again.");
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
        // "https://fylz.onrender.com/file-get",
        "https://fylz.onrender.com/file-get",
        { receiverCode },
        {
          onDownloadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setReceiveProgress(percentCompleted);
          },
        }
      );
      if (response.data.data.fileName) {
        setReceivedFile({
          fileName: response.data.data.fileName,
          url: `https://archivenvo.onrender.com/my-files/${response.data.data.fileName}`
        });
        setReceiveAlertMessage("File received successfully!");
      } else {
        setReceiveAlertMessage("No file found with this code.");
      }
    } catch (error) {
      setReceiveAlertMessage("Error receiving file. Please try again.");
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
      navigator.clipboard.writeText(sharableCode).then(() => {
        setUploadAlertMessage("Code copied to clipboard!");
        setTimeout(() => {
          setUploadAlertMessage(null);
        }, 3000);
      }, (err) => {
        console.error('Could not copy text: ', err);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center px-4">
      <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <h1 className="text-4xl font-bold text-center text-white mb-8">Welcome to FYLz  </h1>

        <div className="flex mb-6">
          <button
            className={`flex-1 py-2 rounded-l-full transition-colors duration-300 ${activeTab === 'upload' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setActiveTab('upload')}
          >
            Upload
          </button>
          <button
            className={`flex-1 py-2 rounded-r-full transition-colors duration-300 ${activeTab === 'receive' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setActiveTab('receive')}
          >
            Receive
          </button>
        </div>

        {activeTab === 'upload' && uploadAlertMessage && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded" role="alert">
            <p>{uploadAlertMessage}</p>
          </div>
        )}
        {activeTab === 'receive' && receiveAlertMessage && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded" role="alert">
            <p>{receiveAlertMessage}</p>
          </div>
        )}

        {activeTab === 'upload' ? (
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
                <span>{file ? file.name : 'Choose File'}</span>
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
           <div className='flex justify-center'>
           <span></span>
           <button 
              onClick={handleCopyCode}
              className="text-black ml-3  bg-slate-50 rounded px-2 py-1 hover:bg-slate-200 transition-colors duration-300"
            >
              <BiCopy />
            </button>
           </div>
            {isUploading && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            )}
          </form>
        ) : (
          <form onSubmit={handleReceive} className="space-y-4">
            <input
              type="text"
              value={receiverCode}
              onChange={(e) => setReceiverCode(e.target.value)}
              placeholder="Enter receiver code"
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Enter receiver code"
            />
            <button
              type="submit"
              disabled={isReceiving}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center"
            >
              {isReceiving ? "Receiving..." : "Receive File"}
            </button>
            {isReceiving && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${receiveProgress}%` }}></div>
              </div>
            )}
          </form>
        )}

        {activeTab === 'receive' && (
          <>
            {receivedFile && (
              <div className="mt-4 p-4 bg-white bg-opacity-20 rounded-lg">
                <p className="text-white mb-2">Received file: {receivedFile.fileName}</p>
                <button
                  onClick={handleDownload}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-full hover:bg-green-600 transition-colors duration-300 flex items-center justify-center"
                >
                  <BiDownload className="mr-2" />
                  Download File
                </button>
              </div>
            )}
          </>
        )}

        <p className="text-sm text-gray-300 mt-6 text-center">
          Files are securely shared and automatically deleted after 5 minutes.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;

