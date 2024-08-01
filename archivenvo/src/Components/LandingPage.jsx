import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
// import PreviousButton from "./PreviousButton";
import { BiSolidSkipPreviousCircle } from "react-icons/bi";

export default function LandingPage() {
  //activators
  const [receiveClicked, setReceiveClicked] = useState(false);
  const [uploadClicked, setUploadClicked] = useState(false);
  const [uploadFilesClicked, setUploadFilesClicked] = useState(false);
  const [submitCodeClicked, setSubmitCodeClicked] = useState(false);
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const [alerter, setAlerter] = useState("");
  //footer
  const [email, seEmail] = useState("");
  const [query, seQuery] = useState("");

  //file
  const [selectedFile, setSelectedFile] = useState("");
  const [code, setCode] = useState("");

  //receive
  const [receiverCode, setReceiverCode] = useState("");
//cancel request 
  const cancelTokenSource = useRef(null);


  //upload clicked
  const submitFilesCode = async (e) => {
    e.preventDefault();
    if (code === "" || code === " ") {
      setAlerter("Enter code First..");
    } else {
      // console.log(code, selectedFile);

      setUploadFilesClicked(true);

      const formData = new FormData();
      formData.append("code", code);
      formData.append("file", selectedFile);

      cancelTokenSource.current = axios.CancelToken.source();


      try {
        const result = await axios.post(
          "https://archivenvo.onrender.com/file-upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            cancelToken: cancelTokenSource.current.token,
          }
        );
        //
        console.log(result.data);
        setAlerter("Uploaded");
        setCode("");
        setSelectedFile("");
        setUploadFilesClicked(false);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("Request canceled:", error.message);
        } else {
          console.log("ERROR NEAR UPLOADING", error);
        }
        setUploadFilesClicked(false);
      }
    }
  };

  function cancelled() {
    setUploadFilesClicked(false)
    if (cancelTokenSource.current) {
      cancelTokenSource.current.cancel("Operation canceled by the user.");
    }
  }

  const [received, setReceived] = useState(null);
  const [url, setUrl] = useState("");

  const submittedReceiveCode = async (e) => {
    e.preventDefault();
    // console.log(receiverCode);
    setSubmitCodeClicked(true);
    cancelTokenSource.current = axios.CancelToken.source();

    try {
      const response = await axios.post("https://archivenvo.onrender.com/file-get", {
        receiverCode,
      }, {            cancelToken: cancelTokenSource.current.token,
      });
      const fileName = response.data.data?.fileName;

      if (fileName) {
        setUrl(`https://archivenvo.onrender.com/my-files/${fileName}`);
        setReceived(response.data.data);
        
        setShowDownloadButton(true);
      } else {
        console.error("No fileName in response data");
          setAlerter("No file exist with the code/ please enter precisely");
        
      }
      setReceiverCode("");
      setSubmitCodeClicked(false);
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Request canceled:", error.message);
      } else {
        console.log("ERROR NEAR UPLOADING", error);
      }
      setUploadFilesClicked(false);
    }
  };

  function submittedQuery() {
    alert("Submitted");
  }

  function getFile() {
    if (received) {
      setUrl(`https://archivenvo.onrender.com/my-files/${received.fileName}`);
      window.open(
        `https://archivenvo.onrender.com/my-files/${received.fileName}`,
        "_blank",
        "noreferrer"
      );
    }
  }

  function handleDown() {
    if (url && received) {
      axios
        .get(url, { responseType: "blob" }) // Make sure to use 'blob' response type
        .then((response) => {
          const blob = new Blob([response.data], {
            type: response.headers["content-type"],
          });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = received.fileName || "downloaded-file"; // Fallback filename
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link); // Clean up the link element
          URL.revokeObjectURL(link.href); // Release memory
        })
        .catch((error) => {
          console.error("Error downloading file:", error);
        });
    } else {
      console.error("URL or received data is not set");
    }
  }
  const [preClicked, setPreClicked] = useState(true);
  function previousClicked() {
    // setPreClicked(true);
    setUploadClicked(false);
    setReceiveClicked(false);
  }

  return (
    <div className="grid mt-16 mx-10 md:mx-48 ">
      <div className="bg-gradient-to-b from-slate-400 to-blue-200 font-bold rounded-t p-4">
        <h1 className="text-4xl text-center font-serif">
          Welcome to ArchivEnvo!
        </h1>
      </div>

      <div className="bg-gradient-to-b h-60 from-slate-300 to-b md:items-center md:flex md:flex-col rounded-b p-10 grid">
        {/* //Dialog box */}
        <div className="text-red-400 text-2xl font-bold">{alerter}</div>
        {(uploadClicked || receiveClicked) && preClicked && (
          <BiSolidSkipPreviousCircle
            className="text-cyan-900 w-8 h-8 ml-64 md:ml-96"
            onClick={previousClicked}
          />
        )}
        {/* <button className="previous bg-red-400 m-1 w-4 h-4 rounded-full" /> */}
        {uploadClicked ? (
          <form action="">
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              name="file"
            />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-5 rounded p-2"
              placeholder="Enter code"
            />

            {/* uploadFilesbutton */}
            <button
              type="submit"
              onClick={submitFilesCode}
              className="mt-5 bg-red-200 rounded ml-3  p-2  hover:bg-purple-300 hover:font-bold"
            >
              {uploadFilesClicked ? "Uploading..." : "Upload files"}
            </button>
            <button
              // type="submit"
              onClick={cancelled}
              className="mt-5 bg-red-400 rounded ml-3  p-2  hover:bg-purple-300 hover:font-bold"
            >
              Cancel
            </button>
          </form>
        ) : (
          !receiveClicked && (
            // upload button
            <button
              onClick={() => setUploadClicked(true)}
              className="mt-5 bg-orange-200 rounded md:w-40 md:justify-center md:flex  p-2   hover:bg-purple-300 hover:font-bold"
            >
              Upload
            </button>
          )
        )}

        {/* //receive form */}

        {receiveClicked ? (
          <form action="">
            <input
              type="text"
              className="mt-5 rounded p-2"
              value={receiverCode}
              placeholder="Enter res code"
              onChange={(e) => setReceiverCode(e.target.value)}
            />
            <button
              type="submit"
              onClick={submittedReceiveCode}
              className="mt-5 bg-red-200 rounded ml-3  p-2   hover:bg-purple-300 hover:font-bold"
            >
              {submitCodeClicked ? "Submitting..." : "Submit"}
            </button>
            <button
              // type="submit"
              onClick={cancelled}
              className="mt-5 bg-red-400 rounded ml-3  p-2  hover:bg-purple-300 hover:font-bold"
            >
              Cancel
            </button>
          </form>
        ) : (
          !uploadClicked && (
            <button
              onClick={() => setReceiveClicked(true)}
              className="mt-5 bg-red-200 rounded  md:w-40   p-2   hover:bg-purple-300 hover:font-bold"
            >
              Receive
            </button>
          )
        )}
        {(uploadClicked || receiveClicked) &&
          !uploadClicked &&
          showDownloadButton && (
            <>
              {" "}
              <h1 className="mt-5"> {received && received.fileName}</h1>
              <div className="flex items-center justify-center">
                <button
                  onClick={handleDown}
                  className="bg-green-300 w-28 mt-8 rounded hover:font-bold hover:bg-purple-200"
                >
                  DOWNLOAD
                </button>
              </div>
            </>
          )}
      </div>

      {/* <img className="w-20 h-20" src={received && received.fileName} alt="" />  */}

      <div className="rules terms grid text-white mt-12">
        <h1 className="mb-10 text-4xl font-semibold">Terms and Conditions</h1>

        <h2 className="text-2xl font-bold">1. Introduction</h2>
        <p>
          Welcome to our file-sharing platform. By accessing or using our
          services, you agree to be bound by these terms and conditions (the
          "Terms"). If you do not agree with any part of these Terms, you must
          not use our services.
        </p>

        <h2 className="text-2xl font-bold mt-6 mb-3">2. Use of Services</h2>
        <h2 className="font-semibold">2.1. File Upload and Sharing</h2>
        <p>
          Users can upload files (such as documents, images, etc.) to our
          platform. Upon uploading a file, a unique code will be generated and
          provided to the sender. The sender is responsible for sharing this
          code with the intended recipient.
        </p>
        <h2 className="font-semibold">2.2. File Access</h2>
        <p>
          Recipients must enter the correct code on our platform to access and
          download the file. The code is valid for a specified period (e.g., 24
          hours) after which it will expire, and the file will no longer be
          accessible.
        </p>

        <h2 className="text-2xl font-bold mt-4">3. Content Restrictions</h2>
        <p>
          Users must not upload files that contain viruses, malware, or any
          other harmful software. Users must not upload content that is
          offensive, obscene, or violates the privacy or intellectual property
          rights of others.
        </p>
        <h2 className="text-2xl font-bold mt-4">4. Data Security</h2>
        <p>
          We take reasonable measures to protect the security of the data
          uploaded to our platform. However, we cannot guarantee the absolute
          security of the data, and users upload files at their own risk.
        </p>
        <h2 className="text-2xl font-bold mt-4">5. Limitation of Liability</h2>
        <p>
          Our platform is provided on an "as-is" and "as-available" basis. We do
          not guarantee that the services will be uninterrupted or error-free.
          We are not liable for any direct, indirect, incidental, or
          consequential damages arising from the use of our services.
        </p>
        <h2 className="text-2xl font-bold mt-4">Information We Collect</h2>
        <p>
          We collect information about the files you upload and download,
          including file names and metadata. You can delete if required.
        </p>
      </div>
      <div className="Footer grid bg-slate-200  mt-10 mb-10 p-10 rounded">
        <h1 className="text-2xl font-semibold">Any queries? </h1>
        <input
          type="text"
          name="email"
          className="mt-3 p-1 rounded md:w-60"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <textarea
          type="text"
          name="query"
          className="mt-3 p-1 rounded md:w-60 resize-none"
          placeholder="Query.."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={submittedQuery}
          className="bg-red-300 mt-2 rounded active:text-white active:bg-green-600 hover:bg-green-600 hover:text-white md:w-20"
        >
          Submit
        </button>
        <h1 className="font-semibold mt-4 text-2xl">For more information: </h1>
        <h2 className="text-2xl">archivenvo@gmail.com</h2>
      </div>
    </div>
  );
}
