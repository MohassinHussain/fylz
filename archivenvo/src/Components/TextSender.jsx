import React, { useState } from "react";
import axios from "axios";
import Previous from "./Previous";

export default function TextSender(props) {
  const [userText, setUserText] = useState("");
  const [textCode, setTextCode] = useState("");

  const [showCopy, setShowCopy] = useState(false);

  const textUploaded = async (e) => {
    e.preventDefault();
    try {
      if (
        (textCode === "" || textCode === " " || textCode === null) ||
        (userText === "" || userText === " " || userText === null)
      ) {
        props.setAlerter("Fill the fields to upload");
      } else {
        //  console.log(userText, textCode);
        const response = await axios.post("https://archivenvo.onrender.com/text-upload", {
          textCode,
          userText,
        });
        console.log(response.data);
        props.setAlerter("Text and code uploaded to database");
        setUserText("");
        setShowCopy(true);
      }
    } catch (e) {
      console.log("ERROR TEXT UPLOADING", e);
    }
  };

  function onCopy() {
    if (textCode) {
      navigator.clipboard
        .writeText(textCode)
        .then(() => {
          // alert("Text copied to clipboard and hidden");
          props.setAlerter("Code copied to clipboard and hidden");
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
      setTextCode("");
      //   setCopiedCode(true)
    } else {
      console.error("Code is empty");
    }
  }

  return (
    <div className="m-4 grid">
      <input
        value={userText}
        onChange={(e) => setUserText(e.target.value)}
        className="p-3 rounded w-80 "
        type="text"
        placeholder="Enter text/ link here"
      />

      <input
        value={textCode}
        onChange={(e) => setTextCode(e.target.value)}
        className="p-3 rounded w-80 mt-2"
        type="text"
        placeholder="Enter code here"
      />
      {showCopy && (
        <button
          onClick={onCopy}
          className="bg-white mt-3 p-2 rounded hover:bg-black hover:text-white hover:font-bold"
        >
          Copy code
        </button>
      )}
      {/* If want to hide the upload button uncomment below */}
      {/* {!showCopy && (
        <button
          onClick={textUploaded}
          className="bg-white mt-3 p-2 rounded hover:bg-black hover:text-white hover:font-bold"
        >
          Upload text
        </button>
        
      )} */}

      <button
        onClick={textUploaded}
        className="bg-white mt-3 p-2 rounded hover:bg-black hover:text-white hover:font-bold"
      >
        Upload text
      </button>
    </div>
  );
}
