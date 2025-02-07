import React from "react";

export default function UploadText() {
  {
    activeTab === "uploadText" && uploadAlertMessage && (
      <div
        className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded"
        role="alert"
      >
        <p>{uploadAlertMessage}</p>
      </div>
    );
  }
  {
    activeTab === "upload" ? (
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
        <div className="flex justify-center">
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
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
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
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${receiveProgress}%` }}
            ></div>
          </div>
        )}
      </form>
    );
  }
}
