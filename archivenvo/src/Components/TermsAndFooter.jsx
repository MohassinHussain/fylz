import React, { useState } from "react";
import axios from "axios";
export default function TermsAndFooter() {
  const [email, setEmail] = useState("");
  const [query, setQuery] = useState("");
  const [thank, setThank] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const submittedQuery = async (e) => {
    e.preventDefault();
    if ((email || query) == "" || (email || query) == " ") {
      alert("Email and query are must to submit");
    } else if (!email.includes("@")) {
      alert("Email is improper");
    }
    // else {
    //     console.log(email, query);
    // }
    else {
      try {
        const result = await axios.post(
          "https://archivenvo.onrender.com/footer",
          { email, query }
        );
        console.log(result.data);
        setSubmitted(true);
        setThank("Thanks for response😊");
      } catch (error) {
        console.log("ERROR IN FOOTER SENDING");
      }
    }
  };
  return (
    <div>
      {/* <div className="rules terms grid text-white mt-12">
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
          including file names and metadata.
        </p>
      </div> */}
      <form className="Footer grid bg-gradient-to-t from-black to-gray-900  mt-10 mb-10 p-10 rounded">
        <h1 className="text-white text-2xl font-semibold">Any queries? </h1>
        <input
          type="email"
          name="email"
          className="mt-3 p-1 rounded md:w-60"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required={true}
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
          className="bg-gradient-to-r from-red-200 to-gray-300 font-semibold p-2 mt-2 text-black rounded  active:bg-green-600 hover:bg-green-600 hover:font-bold md:w-20"
        >
          Submit
        </button>
        {submitted && (
          <h2 className="bg-yellow-200 mt-5 p-2 text-black font-semibold text-center">
            {thank}
          </h2>
        )}
        <h1 className="text-white font-semibold mt-4 text-2xl">
          For more information:{" "}
        </h1>
        <h2 className="text-white text-2xl">archivenvo@gmail.com</h2>
      </form>
    </div>
  );
}
