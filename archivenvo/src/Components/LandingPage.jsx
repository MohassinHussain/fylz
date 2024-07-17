import React, { useEffect, useState } from "react";

export default function LandingPage() {
  const [data, setData] = useState();
  const [secretcode, setSecretcode] = useState("");
  const [b64Strings, setb64Strings] = useState([]);

  function b64Code() {
    let result = "";
    let chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnodfpanxksaksncos;s.,sdsj<>?sd/s\\]d[s[s[-w=9*&#*@)";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  const uploadClicked = () => {
    if (secretcode === "") {
      alert("Please provide code and upload");
    } else {
      console.log(secretcode + b64Code() + "%*&" + secretcode);
      setSecretcode("");
    }
  };

const[fileNames, setFilenames] = useState()
  function handleFileSelection(e) {
    const files = e.target.files;
    setData(files);
    let filenamesArray= []
    for(let i = 0;i<files.length;i++){
        filenamesArray.push(e.target.files[i].name)
    }
    setFilenames(filenamesArray)

    const base64Promises = Array.from(files).map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    });

    Promise.all(base64Promises)
      .then((base64Strings) => {
        console.log(base64Strings); // Log all base64 strings
        setb64Strings(base64Strings); // Optionally store base64 strings for preview
      })
      .catch((error) =>
        console.error("Error converting files to base64:", error)
      );
  }

  // function toB64(data) {

  // }

  // useEffect(()=>{
  //     if(!data) return
  //     let temp = []
  //     for(let i = 0; i< data.length; i++){
  //         temp.push(URL.createObjectURL(data[i]))
  //     }
  //     const urls = temp;
  //     setPreviews(urls)
  //     // temp = URL.createObjectURL(data)
  //     // previews = temp;
  // }, [data])

  return (
    <div className="grid mt-16 items-center justify-center mx-10 md:mx-48">
      <div className="bg-gradient-to-b from-slate-400 to-blue-200 font-bold rounded-t p-4">
        <h1 className="text-4xl text-center">Welcome to ArchivEnvo</h1>
      </div>

      <div className="grid items-center justify-center bg-gradient-to-b from-slate-200 to-blue-700 p-6 rounded-b">
        { fileNames && <h1 className="text-2xl font-semibold">Selected files</h1>}
        {fileNames && fileNames.map((file, index)=>{
            return (<div className="" key={index}>
                   <li>{file}</li> 
            </div>)
        })}
        {data && (
          <div className="bg-slate-200 text-black font-semibold p-2  rounded mt-3 hover:bg-blue-200 transition hover:text-black shadow-2xl drop-shadow-2xl">
            <input
              type="text"
              name="secretcode"
              value={secretcode}
              onChange={(e) => setSecretcode(e.target.value)}
              placeholder="Enter secret code"
              className="h-10 w-full text-2xl"
            />
          </div>
        )}
        {data ? (
          <button
            className="font-semibold bg-slate-300 mt-5 mb-8 p-4 rounded text-2xl hover:bg-blue-400 transition shadow-2xl drop-shadow-2xl	"
            onClick={uploadClicked}
          >
            Upload
          </button>
        ) : (
          <input
            type="file"
            // value={data}
            multiple={true}
            name="file"
            onChange={handleFileSelection}
            className="font-semibold bg-slate-300 mt-5 mb-8 p-4 rounded  hover:bg-blue-400 transition shadow-2xl drop-shadow-2xl"
          />
        )}
        {/* {
            b64Strings && b64Strings.map((pic, i) => {
                return <img key={i} src={pic} alt="" />
            })
        } */}
        {/* <img src={b64Strings} alt="" /> */}
        {/* { previews &&
            previews.map((pic) => {
                return <img src={pic} alt="" />
            })
        } */}
        {/* <img src={previews} alt="" /> */}
        <button className="bg-slate-500 text-white font-semibold p-4 rounded text-2xl hover:bg-blue-200 transition hover:text-neutral-800 shadow-2xl drop-shadow-2xl">
          Receive
        </button>
      </div>
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
        />
        <textarea
          type="text"
          name="query"
          className="mt-3 p-1 rounded md:w-60 resize-none"
          placeholder="Query.."
        />
        <h1 className="font-semibold mt-4 text-2xl">For more information: </h1>
        <h2 className="text-2xl">archivenvo@gmail.com</h2>
      </div>
    </div>
  );
}
