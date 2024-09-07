import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
// import PreviousButton from "./PreviousButton";
import { BiSolidSkipPreviousCircle } from "react-icons/bi";
import TermsAndFooter from "./TermsAndFooter";
// import DemoVideo from "./DemoVideo";
import TextSender from "./TextSender";
import Previous from "./Previous";

import ReactGA from 'react-ga4';

export default function LandingPage(props) {
  // useEffect(()=>{
  //   ReactGA.pageview(window.location.pathname)
  // }, [])
  ReactGA.send({
    hitType: "pageview",
    page: "/",
    title: "LANDING"
  })
  //activators
  const [receiveClicked, setReceiveClicked] = useState(false);
  const [uploadClicked, setUploadClicked] = useState(false);
  const [uploadFilesClicked, setUploadFilesClicked] = useState(false);
  const [submitCodeClicked, setSubmitCodeClicked] = useState(false);
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const [alerter, setAlerter] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  //for text uploading
  const [uploadTextClicked, setUploadTextClicked] = useState(false);

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

  let encoded = "";
  const [dispCode, setDispCode] = useState("");

  //upload clicked
  const submitFilesCode = async (e) => {
    e.preventDefault();
    if (code === "" || code === " ") {
      setAlerter("Enter code First..");
    } else {
      // console.log(code, selectedFile);
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZASDaasddhsnkfdjrtuoeosjWERTYUIOP{:MXK<C>LSMSHAK<>shskshwik";
      let result = "";
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      //  setCode("code+result")
      encoded = code + result;
      setUploadFilesClicked(true);
      setDispCode(encoded);
      const formData = new FormData();
      formData.append("code", encoded);
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
        setShowCode(true);
        console.log(result.data);
        setAlerter("Uploaded");

        // setCode("");x
        // setSelectedFile();
        setUploadFilesClicked(false);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("Request canceled:", error.message);
        } else {
          console.log("ERROR NEAR UPLOADING CANCELLATION", error);
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

  const [receivedUserText, setReceivedUserText] = useState("");

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
      const userText = response.data.data.userText;
      setReceivedUserText(response.data.data.userText);
      // console.log(receivedUserText);

      if (fileName) {
        setUrl(`https://archivenvo.onrender.com/my-files/${fileName}`);
        setReceived(response.data.data);
        setAlerter("Got File");
        setShowDownloadButton(true);

        // setSubmitCodeClicked(false);
      } else {
        // console.error("No fileName in response data");
        // setAlerter("No file exist with the code/ please enter precisely");
        if (userText) {
          console.log("USER TEXT RECEIVED: ", userText);
          setAlerter("The required test is: ");
          // setSubmitCodeClicked(false);
        } else {
          setSubmitCodeClicked(false);
          console.error("No fileName in response data");
          setAlerter(
            "No file/ text exist with the code. Please enter precisely"
          );
        }
        setSubmitCodeClicked(false);
      }
      setReceiverCode("");
      setSubmitCodeClicked(false);
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Request canceled:", error.message);
      } else {
        // console.log("ERROR NEAR UPLOADING", error);
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
  // function previousClicked() {
  //   // setPreClicked(true);
  //   setUploadClicked(false);
  //   setReceiveClicked(false);
  //   setShowCode(false);
  //   setAlerter("");
  // }

  function onCopy(e) {
    e.preventDefault();
    // let copied = senderCode
    if (dispCode) {
      navigator.clipboard
        .writeText(dispCode)
        .then(() => {
          // alert("Text copied to clipboard and hidden");
          setAlerter("Code copied to clipboard");
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
      setCode("");
      setCopiedCode(true);
    } else {
      console.error("Code is empty");
    }
  }

  function onTextCopy(e) {
    e.preventDefault();
    if (receivedUserText) {
      navigator.clipboard
        .writeText(receivedUserText)
        .then(() => {
          // alert("Text copied to clipboard and hidden");
          setAlerter("Text copied to clipboard");
          setReceiverCode("");
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
      setCode("");
      setCopiedCode(true);
    } else {
      console.error("text is empty");
    }
  }

  return (
    <div className="grid mt-16 mx-10 md:mx-96 ">
      {/* <div className="logo">
        <img
          src="/inSiteLogo.jpg"
          className="rounded w-full mb-10 mix-blend-lighten hover:translate-y-3 hover:translate-x-6 hover:drop-shadow-lg hover:transition-all"
          alt=""
        />
        
      </div> */}

      <div className=" text-white border-x-2 border-y-1  font-bold rounded-b rounded-full p-4">
        <h1 className="text-4xl text-center">Welcome to ArchivEnvo!</h1>
      </div>

      <div className="rounded-3xl hover:border-blue-400 bg-gradient-to-t from-black to-gray-900 hover:transition-all border-x-2 border-y-2 mb-10 to-b md:items-center md:flex md:flex-col  p-10 grid">
        {/* //Dialog box */}
        <div className="text-red-400 text-2xl font-bold">{alerter}</div>
        {(uploadClicked || receiveClicked) && preClicked && (
          // <BiSolidSkipPreviousCircle
          //   className="text-cyan-100 w-8 h-8 ml-64 md:ml-96"
          //   onClick={previousClicked}
          // />
          <Previous
            setUploadClicked={setUploadClicked}
            setReceiveClicked={setReceiveClicked}
            setShowCode={setShowCode}
            setAlerter={setAlerter}
          />
        )}
        {/* <h1>{code}</h1> */}
        {showCode && (
          <div className="grid">
            <h2 className="text-white">
              Your file lasts for 5 mins, share this code: <b>{dispCode}</b>
            </h2>
            <button
              onClick={onCopy}
              className="mt-2 mb-3 bg-gradient-to-r from-gray-200 to-gray-500 font-semibold rounded-full  p-2  hover:bg-purple-300 hover:font-bold"
            >
              Copy
            </button>
            {/* <div className="text-red-400 text-2xl font-bold">{alerter}</div> */}
          </div>
        )}
        {/* <button className="previous bg-red-400 m-1 w-4 h-4 rounded-full" /> */}
        {uploadClicked && !showCode ? (
          <form action="" className="grid">
            <input
              className="p-2 border-x-2 border-y-2 rounded-full bg-slate-500"
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              name="file"
            />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-3 rounded p-2"
              placeholder="Enter code"
            />

            {/* uploadFilesbutton */}
            <button
              type="submit"
              onClick={submitFilesCode}
              className="mt-5 bg-gradient-to-r from-gray-200 to-gray-500 font-semibold rounded-full ml-3  p-2  hover:bg-purple-300 hover:font-bold"
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
              className="bg-gradient-to-r from-red-200 to-gray-500 font-semibold mt-5  rounded-full ml-3  p-2  hover:bg-purple-300 hover:font-bold"
            >
              Cancel
            </button>
          </form>
        ) : (
          !receiveClicked &&
          // upload button : add -> && !uploadTextClicked) to hide upload button
          !showCode && (
            <button
              onClick={() => setUploadClicked(true)}
              className="mt-5 bg-gradient-to-r from-gray-200 to-gray-500 font-semibold rounded-full md:w-40 md:justify-center md:flex  p-2   hover:bg-purple-300 hover:font-bold"
            >
              Upload
            </button>
          )
        )}

        {/* //receive form */}

        {receiveClicked ? (
          <form action="" className="grid">
            {receivedUserText && (
              <div>
                <h3 className="bg-yellow-100 font-bold p-2 rounded">
                  {" "}
                  {receivedUserText}
                </h3>
                <button
                  onClick={onTextCopy}
                  className="mt-2 mb-3 bg-gradient-to-r from-gray-200 to-gray-500 font-semibold rounded-full  p-2  hover:bg-purple-300 hover:font-bold"
                >
                  Copy
                </button>
              </div>
            )}
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
              className="mt-5 bg-gradient-to-r from-gray-200 to-gray-400 font-semibold rounded-full  md:justify-center md:flex  p-2   hover:bg-purple-300 hover:font-bold"
            >
              {submitCodeClicked ? "Submitting..." : "Submit"}
            </button>
            <button
              // type="submit"
              onClick={cancelled}
              className="bg-gradient-to-r from-red-200 to-gray-500 font-semibold mt-5  rounded-full   p-2  hover:bg-purple-300 hover:font-bold"
            >
              Cancel
            </button>
          </form>
        ) : (
          // add -> && !uploadTextClicked) to hide receive button
          !uploadClicked && (
            <button
              onClick={() => setReceiveClicked(true)}
              className="mt-5 bg-gradient-to-r from-blue-200 to-gray-500 font-semibold rounded-full md:w-40 md:justify-center md:flex  p-2   hover:font-bold"
            >
              Receive
            </button>
          )
        )}
        {(uploadClicked || receiveClicked) &&
          !uploadClicked &&
          showDownloadButton && (
            <>
              <h1 className="mt-5 bg-gray-200 rounded w-fit">
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

        {!uploadClicked && !receiveClicked && !uploadTextClicked && (
          <button
            onClick={(e) => setUploadTextClicked(true)}
            className="bg-white mt-5 rounded-full p-2 md:w-40"
          >
            Upload text
          </button>
        )}
        {!uploadClicked && !receiveClicked && (
          <div>
            {uploadTextClicked && (
              <TextSender
                alerter={alerter}
                setAlerter={setAlerter}
                setUploadTextClicked={setUploadTextClicked}
              />
            )}
          </div>
        )}
      </div>

      <h3>
        <i className=" text-gray-200">
          <b className="font-bold">Note: </b>
          File sharing app! Upload and relax everything is secured.{" "}
          <b>
            {" "}
            Upload file and enter code, make sure to share the code with the
            person you want the file to be shared.
          </b>
          The Shared things will last only for 5 minutes after upload, after{" "}
          <b> 5 Minutes </b> the data will be erased from the server.
        </i>
      </h3>

      {/* <img className="w-20 h-20" src={received && received.fileName} alt="" />  */}

      {/* Terms and footer */}
      {/* <DemoVideo></DemoVideo> */}
      <TermsAndFooter />
    </div>
  );
}
