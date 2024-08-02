import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
// import PreviousButton from "./PreviousButton";
import { BiSolidSkipPreviousCircle } from "react-icons/bi";
import TermsAndFooter from "./TermsAndFooter";

export default function LandingPage() {
  //activators
  const [receiveClicked, setReceiveClicked] = useState(false);
  const [uploadClicked, setUploadClicked] = useState(false);
  const [uploadFilesClicked, setUploadFilesClicked] = useState(false);
  const [submitCodeClicked, setSubmitCodeClicked] = useState(false);
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const [alerter, setAlerter] = useState("");

  //file
  const [selectedFile, setSelectedFile] = useState("");
  const [code, setCode] = useState("");

  //encoding code
  const [secretCode, setSecretCode] = useState("");

  //receive
  const [receiverCode, setReceiverCode] = useState("");
  //cancel request
  const cancelTokenSource = useRef(null);

  // useEffect(()=>{
  //   console.log(typeof(selectedFile));
  // }, [])

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
    setUploadFilesClicked(false);
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
      const response = await axios.post(
        "https://archivenvo.onrender.com/file-get",
        {
          receiverCode,
        },
        { cancelToken: cancelTokenSource.current.token }
      );
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
    setAlerter("");
  }

  return (
    <div className="grid mt-16 mx-10 md:mx-48 ">
      <div className="logo">
        <img
          src="src\assets\inSiteLogo.jpg"
          className="rounded w-full mb-10 mix-blend-lighten hover:translate-y-3 hover:translate-x-6 hover:drop-shadow-lg hover:transition-all"
          alt=""
        />
        <h3>
          <i className=" text-gray-200">
            <b className="font-bold">Note: </b>
            File sharing app! Upload and relax everything is secured. <b> Upload
            file and enter code, make sure to share the code with the person you
            want the file to be shared.</b>
            The Shared things will last only for 5 minutes after upload, after <b> 5 Minutes </b> the data will be erased from the server.
          </i>
        </h3>
      </div>

      <div className="bg-gradient-to-b from-slate-400 to-blue-200 font-bold rounded-t p-4">
        <h1 className="text-4xl text-center font-serif">
          Welcome to ArchivEnvo!
        </h1>
      </div>

      <div className="bg-gradient-to-b h-70 mb-32 from-slate-300 to-b md:items-center md:flex md:flex-col rounded-b p-10 grid">
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
          <form action="" className="grid">
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
            {/* {uploadFilesClicked &&  <button
              // type="submit"
              onClick={cancelled}
              className="mt-5 bg-red-400 rounded ml-3  p-2  hover:bg-purple-300 hover:font-bold"
            >
              Cancel
            </button>} */}
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
          <form action="" className="grid">
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
              <h1 className="mt-5 bg-gray-200 rounded w-fit">
                {" "}
                {received && received.fileName}
              </h1>
              <div className="flex items-center justify-center">
                <button
                  onClick={handleDown}
                  className="bg-green-300 w-28 mt-8 mb-10 rounded hover:font-bold hover:bg-purple-200"
                >
                  DOWNLOAD
                </button>
              </div>
            </>
          )}
      </div>

      {/* <img className="w-20 h-20" src={received && received.fileName} alt="" />  */}

      {/* Terms and footer */}
      <TermsAndFooter />
    </div>
  );
}
