import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import {
  BiUpload,
  BiDownload,
  BiCopy,
  BiX,
  BiCheck,
  BiFile,
  BiText,
  BiUser,
  BiSearch,
  BiSend,
  BiTime,
  BiBell,
  BiLogOut,
  BiShow,
  BiHide,
  BiLock,
} from "react-icons/bi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("fylz_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && err.response?.data?.expired) {
      localStorage.removeItem("fylz_token");
      localStorage.removeItem("fylz_user");
      window.location.reload();
    }
    return Promise.reject(err);
  }
);

const copyToClipboard = (text) => {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
};

const hashCode = async (code) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomChars = "";
  for (let i = 0; i < 3; i++) {
    randomChars += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code + randomChars;
};

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState("send");
  const [files, setFiles] = useState([]);
  const [code, setCode] = useState("");
  const [hashedCode, setHashedCode] = useState("");
  const [receiverCode, setReceiverCode] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [receivedFile, setReceivedFile] = useState(null);
  const [receivedText, setReceivedText] = useState(null);
  const [sharableCode, setSharableCode] = useState(null);
  const [textContent, setTextContent] = useState("");
  const [notification, setNotification] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const textAreaRef = useRef(null);

  // Auth state
  const [currentUser, setCurrentUser] = useState(() => localStorage.getItem("fylz_user") || "");
  const [token, setToken] = useState(() => localStorage.getItem("fylz_token") || "");
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthing, setIsAuthing] = useState(false);
  const [authError, setAuthError] = useState("");

  // Sharing state
  const [recipient, setRecipient] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [shares, setShares] = useState({ files: [], texts: [] });
  const [showShares, setShowShares] = useState(false);

  useEffect(() => {
    if (code) {
      hashCode(code).then(setHashedCode);
    }
  }, [code]);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [textContent]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (currentUser && token) {
      fetchShares();
    }
  }, [currentUser, token]);

  const fetchShares = useCallback(async () => {
    try {
      const res = await api.get("/shares");
      setShares(res.data);
    } catch {
      // silently fail
    }
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError("");

    if (!usernameInput.trim() || usernameInput.trim().length < 2) {
      setAuthError("Username must be at least 2 characters.");
      return;
    }
    if (!passwordInput || passwordInput.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }

    setIsAuthing(true);
    try {
      const res = await api.post("/user/auth", {
        username: usernameInput.trim(),
        password: passwordInput,
      });
      setCurrentUser(res.data.username);
      setToken(res.data.token);
      localStorage.setItem("fylz_user", res.data.username);
      localStorage.setItem("fylz_token", res.data.token);
      showNotification(res.data.isNewUser ? `Account created! Welcome, ${res.data.username}.` : `Welcome back, ${res.data.username}!`);
    } catch (err) {
      setAuthError(err.response?.data?.error || "Authentication failed.");
    } finally {
      setIsAuthing(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser("");
    setToken("");
    localStorage.removeItem("fylz_user");
    localStorage.removeItem("fylz_token");
    setShares({ files: [], texts: [] });
  };

  const searchUsers = useCallback(async (query) => {
    if (!query || query.length < 1) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await api.get(`/user/search?q=${encodeURIComponent(query)}`);
      setSearchResults(res.data);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const searchTimeout = useRef(null);
  const handleRecipientChange = (e) => {
    const val = e.target.value;
    setRecipient(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchUsers(val), 300);
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!files.length || !hashedCode) {
      showNotification("Please select files and enter a code.", "error");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("code", hashedCode);
    if (recipient.trim()) formData.append("recipient", recipient.trim().toLowerCase());

    try {
      await api.post("/file-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      });
      setSharableCode(hashedCode);
      copyToClipboard(hashedCode);
      showNotification("Files uploaded! Code copied to clipboard.");
    } catch {
      showNotification("Upload failed. Please try again.", "error");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleTextUpload = async (e) => {
    e.preventDefault();
    if (!textContent.trim() || !hashedCode) {
      showNotification("Please enter text and a code.", "error");
      return;
    }

    setIsUploading(true);
    try {
      await api.post("/text-upload", {
        textCode: hashedCode,
        userText: textContent,
        recipient: recipient.trim() ? recipient.trim().toLowerCase() : null,
      });
      setSharableCode(hashedCode);
      copyToClipboard(hashedCode);
      showNotification("Text uploaded! Code copied to clipboard.");
    } catch {
      showNotification("Upload failed. Please try again.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleReceive = async (e) => {
    e.preventDefault();
    if (!receiverCode.trim()) {
      showNotification("Please enter a code.", "error");
      return;
    }

    setIsReceiving(true);
    setReceivedFile(null);
    setReceivedText(null);

    try {
      const response = await api.post("/file-get", { receiverCode });
      if (response.data.status === "ok") {
        if (response.data.type === "file") {
          setReceivedFile({ fileNames: response.data.data.fileNames });
        } else if (response.data.type === "text") {
          setReceivedText(response.data.data.userText);
        }
        showNotification("Content received!");
      }
    } catch {
      showNotification("No content found with this code.", "error");
    } finally {
      setIsReceiving(false);
    }
  };

  const handleCopyCode = (text) => {
    copyToClipboard(text);
    showNotification("Copied to clipboard!");
  };

  const handleDownload = (fileName) => {
    const link = document.createElement("a");
    link.href = `${API_BASE}/my-files/${fileName}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const resetState = () => {
    setFiles([]);
    setCode("");
    setSharableCode(null);
    setReceivedFile(null);
    setReceivedText(null);
    setReceiverCode("");
    setTextContent("");
    setRecipient("");
    setSearchResults([]);
  };

  // Auth Screen
  if (!currentUser || !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        {notification && (
          <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in ${
            notification.type === "error" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
          }`}>
            {notification.type === "error" ? <BiX size={20} /> : <BiCheck size={20} />}
            <span className="font-medium">{notification.message}</span>
          </div>
        )}

        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold text-white mb-2 tracking-tight">
              FYL<span className="text-purple-400">z</span>
            </h1>
            <p className="text-slate-400 text-sm">Share files & text without third-party logins</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BiLock size={32} className="text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-1">Enter Credentials</h2>
              <p className="text-slate-400 text-sm">New username creates an account automatically</p>
            </div>

            {authError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2">
                <BiX className="text-red-400 flex-shrink-0" size={16} />
                <span className="text-red-300 text-sm">{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="relative">
                <BiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => { setUsernameInput(e.target.value); setAuthError(""); }}
                  placeholder="Username"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  autoFocus
                />
              </div>

              <div className="relative">
                <BiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => { setPasswordInput(e.target.value); setAuthError(""); }}
                  placeholder="Password (min 6 characters)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <BiHide size={18} /> : <BiShow size={18} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isAuthing}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                {isAuthing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <BiLock />
                    Continue
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-slate-500 text-xs mt-6">
              Session expires after 1 hour. No data stored on device.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main App
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center px-4 py-6">
      {notification && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in ${
          notification.type === "error" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
        }`}>
          {notification.type === "error" ? <BiX size={20} /> : <BiCheck size={20} />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Top bar */}
      <div className="w-full max-w-lg flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">
          FYL<span className="text-purple-400">z</span>
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setShowShares(!showShares); fetchShares(); }}
            className="relative bg-white/10 hover:bg-white/15 rounded-xl px-3 py-2 text-slate-300 transition-all flex items-center gap-2"
          >
            <BiBell size={18} />
            {shares.files.length + shares.texts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                {shares.files.length + shares.texts.length}
              </span>
            )}
          </button>
          <div className="bg-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
            <BiUser size={16} className="text-purple-400" />
            <span className="text-white text-sm font-medium">{currentUser}</span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white/5 hover:bg-white/10 rounded-xl px-3 py-2 text-slate-400 hover:text-white transition-all"
            title="Logout"
          >
            <BiLogOut size={18} />
          </button>
        </div>
      </div>

      {/* Incoming shares panel */}
      {showShares && (
        <div className="w-full max-w-lg mb-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <BiBell className="text-purple-400" />
            Incoming Shares
          </h3>
          {shares.files.length === 0 && shares.texts.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">No incoming shares</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {shares.files.map((share, i) => (
                <div key={`f-${i}`} className="bg-white/5 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <BiFile className="text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{share.sender} sent {share.fileCount} file(s)</p>
                      <p className="text-slate-500 text-xs">Code: {share.code}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setReceiverCode(share.code);
                      setShowShares(false);
                      setActiveTab("receive");
                    }}
                    className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-3 py-1.5 rounded-lg text-sm transition-all"
                  >
                    Fetch
                  </button>
                </div>
              ))}
              {shares.texts.map((share, i) => (
                <div key={`t-${i}`} className="bg-white/5 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <BiText className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{share.sender} sent text</p>
                      <p className="text-slate-500 text-xs">Code: {share.code}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setReceiverCode(share.code);
                      setShowShares(false);
                      setActiveTab("receive");
                    }}
                    className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-3 py-1.5 rounded-lg text-sm transition-all"
                  >
                    Fetch
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="w-full max-w-lg">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          <div className="flex border-b border-white/10">
            <button
              onClick={() => { setActiveTab("send"); resetState(); }}
              className={`flex-1 py-4 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === "send" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <BiUpload size={18} />
              Send
            </button>
            <button
              onClick={() => { setActiveTab("receive"); resetState(); }}
              className={`flex-1 py-4 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === "receive" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <BiDownload size={18} />
              Receive
            </button>
          </div>

          <div className="p-6">
            {activeTab === "send" && (
              <div className="space-y-5">
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setActiveTab("sendFiles")}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === "sendFiles" || activeTab === "send"
                        ? "bg-purple-500/30 text-purple-300 border border-purple-500/30"
                        : "bg-white/5 text-slate-400 border border-transparent hover:bg-white/10"
                    }`}
                  >
                    <BiFile className="inline mr-1" size={14} />
                    Files
                  </button>
                  <button
                    onClick={() => setActiveTab("sendText")}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === "sendText"
                        ? "bg-purple-500/30 text-purple-300 border border-purple-500/30"
                        : "bg-white/5 text-slate-400 border border-transparent hover:bg-white/10"
                    }`}
                  >
                    <BiText className="inline mr-1" size={14} />
                    Text
                  </button>
                </div>

                {/* Recipient selector */}
                <div className="relative">
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                    <BiSearch size={16} className="text-slate-500" />
                    <input
                      type="text"
                      value={recipient}
                      onChange={handleRecipientChange}
                      placeholder="Send to user (optional)..."
                      className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm"
                    />
                    {recipient && (
                      <button onClick={() => { setRecipient(""); setSearchResults([]); }} className="text-slate-500 hover:text-white">
                        <BiX size={14} />
                      </button>
                    )}
                  </div>
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-white/10 rounded-xl shadow-xl overflow-hidden">
                      {searchResults.map((user) => (
                        <button
                          key={user}
                          onClick={() => {
                            setRecipient(user);
                            setSearchResults([]);
                          }}
                          className="w-full px-4 py-2.5 text-left text-slate-300 hover:bg-white/10 flex items-center gap-2 text-sm"
                        >
                          <BiUser size={14} className="text-purple-400" />
                          {user}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {(activeTab === "send" || activeTab === "sendFiles") && (
                  <form onSubmit={handleUpload} className="space-y-4">
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                        dragActive ? "border-purple-400 bg-purple-500/10" : "border-white/20 hover:border-white/40 hover:bg-white/5"
                      }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        multiple
                        className="hidden"
                      />
                      <BiUpload size={32} className="mx-auto text-slate-400 mb-2" />
                      <p className="text-slate-300 text-sm">
                        {files.length ? `${files.length} file(s) selected` : "Drop files here or click to browse"}
                      </p>
                      <p className="text-slate-500 text-xs mt-1">Max 10 files, 20MB each</p>
                    </div>

                    {files.length > 0 && (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {files.map((file, i) => (
                          <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                            <span className="text-slate-300 text-sm truncate flex-1">{file.name}</span>
                            <span className="text-slate-500 text-xs ml-2">{formatFileSize(file.size)}</span>
                            <button type="button" onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="ml-2 text-slate-400 hover:text-red-400">
                              <BiX size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Enter a code (e.g., myfiles)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    />

                    {hashedCode && (
                      <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-2">
                        <span className="text-purple-300 text-sm flex-1 truncate">Code: {hashedCode}</span>
                        <button type="button" onClick={() => handleCopyCode(hashedCode)} className="text-purple-400 hover:text-purple-300">
                          <BiCopy size={16} />
                        </button>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isUploading}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <BiSend />
                          {recipient ? `Send to ${recipient}` : "Upload Files"}
                        </>
                      )}
                    </button>

                    {isUploading && (
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    )}
                  </form>
                )}

                {activeTab === "sendText" && (
                  <form onSubmit={handleTextUpload} className="space-y-4">
                    <textarea
                      ref={textAreaRef}
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      placeholder="Paste or type your text here..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none min-h-[120px]"
                      rows={1}
                    />

                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Enter a code (e.g., mytext)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    />

                    {hashedCode && (
                      <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-2">
                        <span className="text-purple-300 text-sm flex-1 truncate">Code: {hashedCode}</span>
                        <button type="button" onClick={() => handleCopyCode(hashedCode)} className="text-purple-400 hover:text-purple-300">
                          <BiCopy size={16} />
                        </button>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isUploading}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <BiSend />
                          {recipient ? `Send to ${recipient}` : "Upload Text"}
                        </>
                      )}
                    </button>
                  </form>
                )}

                {sharableCode && (
                  <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                    <p className="text-emerald-300 text-sm mb-2">
                      {recipient ? `${recipient} can use this code:` : "Share this code:"}
                    </p>
                    <div className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2">
                      <span className="text-white font-mono text-lg flex-1">{sharableCode}</span>
                      <button onClick={() => handleCopyCode(sharableCode)} className="text-emerald-400 hover:text-emerald-300">
                        <BiCopy size={18} />
                      </button>
                    </div>
                    <p className="text-slate-500 text-xs mt-2">Auto-deletes after 4 minutes</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "receive" && (
              <div className="space-y-5">
                <form onSubmit={handleReceive} className="space-y-4">
                  <input
                    type="text"
                    value={receiverCode}
                    onChange={(e) => setReceiverCode(e.target.value)}
                    placeholder="Enter the code you received"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  />

                  <button
                    type="submit"
                    disabled={isReceiving}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    {isReceiving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Fetching...
                      </>
                    ) : (
                      <>
                        <BiDownload />
                        Fetch Content
                      </>
                    )}
                  </button>
                </form>

                {receivedFile?.fileNames?.length > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                    <p className="text-slate-300 text-sm font-medium">Files found:</p>
                    {receivedFile.fileNames.map((fileName, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleDownload(fileName)}
                        className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-lg px-3 py-2.5 transition-all text-left"
                      >
                        <BiFile className="text-purple-400 flex-shrink-0" size={18} />
                        <span className="text-slate-300 text-sm truncate flex-1">{fileName}</span>
                        <BiDownload className="text-slate-500 flex-shrink-0" size={16} />
                      </button>
                    ))}
                    {receivedFile.fileNames.length > 1 && (
                      <button
                        onClick={handleDownloadAll}
                        className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                      >
                        <BiDownload />
                        Download All as ZIP
                      </button>
                    )}
                  </div>
                )}

                {receivedText && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-slate-300 text-sm font-medium">Text content:</p>
                      <button onClick={() => handleCopyCode(receivedText)} className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-sm">
                        <BiCopy size={14} />
                        Copy
                      </button>
                    </div>
                    <div className="bg-black/20 rounded-lg p-4 text-sm text-slate-300 max-h-64 overflow-y-auto prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || "");
                            return !inline && match ? (
                              <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" {...props}>
                                {String(children).replace(/\n$/, "")}
                              </SyntaxHighlighter>
                            ) : (
                              <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs" {...props}>{children}</code>
                            );
                          },
                        }}
                      >
                        {receivedText}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          No third-party logins. No accounts elsewhere. Just share.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
