import React, { useState, useEffect } from "react";
import socket from "../socket";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Dashboard = () => {
  const [recipient, setRecipient] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [receivedFile, setReceivedFile] = useState(null);
  const [sentHistory, setSentHistory] = useState([]);
  const [receivedHistory, setReceivedHistory] = useState([]);

  const navigate = useNavigate();
  const userEmail = localStorage.getItem("user");

  useEffect(() => {
    if (!userEmail) {
      navigate("/");
    }
  }, [navigate, userEmail]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploadSuccess(false);
  };

  const handleUpload = () => {
    if (!selectedFile || !recipient) {
      alert("Please select a file and enter recipient email!");
      return;
    }

    setUploading(true);
    const reader = new FileReader();

    reader.onload = () => {
      const arrayBuffer = reader.result;

      socket.emit("send-file", {
        name: selectedFile.name,
        buffer: arrayBuffer,
        to: recipient,
      });

      setTimeout(() => {
        setUploading(false);
        setUploadSuccess(true);

        setSentHistory((prev) => [
          ...prev,
          {
            name: selectedFile.name,
            recipient,
            time: new Date().toLocaleTimeString(),
          },
        ]);
      }, 1000);
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  useEffect(() => {
    socket.on("receive-file", ({ name, buffer }) => {
      setReceivedFile(name);

      const blob = new Blob([buffer]);
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);

      setReceivedHistory((prev) => [
        ...prev,
        {
          name,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    });

    return () => {
      socket.off("receive-file");
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-purple-600 flex flex-col items-center justify-center text-white p-4 relative">
      {/* User info & logout */}
      <div className="absolute top-4 right-4 text-sm text-right">
        <p className="font-semibold">{userEmail}</p>
        <button
          onClick={handleLogout}
          className="mt-1 text-red-300 hover:text-red-500 text-xs underline"
        >
          Logout
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6">🔄 Realtime File Transfer</h1>

      {/* Upload Box with Animation */}
      <motion.div
        className="bg-white p-6 rounded-xl shadow-md text-black w-full max-w-md"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Recipient email input */}
        <input
          type="email"
          placeholder="Enter recipient's email"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="mb-4 w-full px-4 py-2 border border-gray-300 rounded"
        />

        {/* File input */}
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full mb-4 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
        />

        {/* Upload button */}
        <button
          onClick={handleUpload}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload & Send"}
        </button>

        {/* Progress bar */}
        {uploading && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
            <div className="bg-green-500 h-2.5 rounded-full animate-pulse w-full"></div>
          </div>
        )}

        {/* Upload success */}
        {uploadSuccess && (
          <motion.p
            className="text-green-600 font-semibold mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            ✅ File sent successfully!
          </motion.p>
        )}

        {/* Received file */}
        {receivedFile && (
          <motion.p
            className="text-blue-600 font-semibold mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            📥 Received file:{" "}
            <span className="font-mono">{receivedFile}</span>
          </motion.p>
        )}
      </motion.div>

      {/* History Section with Animation */}
      <motion.div
        className="mt-10 w-full max-w-md text-left text-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h2 className="text-xl font-bold mb-2">📤 Sent Files</h2>
        {sentHistory.length === 0 ? (
          <p className="text-sm text-gray-200">No files sent yet.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {sentHistory.map((item, idx) => (
              <li key={idx}>
                ✅ <span className="font-medium">{item.name}</span> to{" "}
                <span className="italic">{item.recipient}</span> at {item.time}
              </li>
            ))}
          </ul>
        )}

        <h2 className="text-xl font-bold mt-6 mb-2">📥 Received Files</h2>
        {receivedHistory.length === 0 ? (
          <p className="text-sm text-gray-200">No files received yet.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {receivedHistory.map((item, idx) => (
              <li key={idx}>
                📁 <span className="font-medium">{item.name}</span> at{" "}
                {item.time}
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
