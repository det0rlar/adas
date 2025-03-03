import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { FiUpload } from "react-icons/fi";

const SummarizedVideoPage = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const [eventData, setEventData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [inputURL, setInputURL] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summaryText, setSummaryText] = useState("");
  const [audioPreview, setAudioPreview] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventDoc = await getDoc(doc(db, "events", eventId));
        setEventData(
          eventDoc.exists() ? { id: eventDoc.id, ...eventDoc.data() } : null
        );
      } catch (err) {
        setError("Error fetching event data.");
      }
    };
    fetchEvent();
  }, [eventId]);

  if (eventData && user.uid !== eventData.creatorId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-red-500 text-xl">Unauthorized access</p>
      </div>
    );
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("audio/")) {
      setSelectedFile(file);
      setAudioPreview(URL.createObjectURL(file));
    } else {
      setError("Please upload an audio file.");
      setSelectedFile(null);
      setAudioPreview(null);
    }
  };

  const handleSummarize = async () => {
    setLoading(true);
    setError("");
    setSummaryText("");

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("file", selectedFile);
      } else if (inputURL) {
        formData.append("url", inputURL);
      } else {
        setError("Please upload an audio file or enter a valid URL.");
        setLoading(false);
        return;
      }
      formData.append("language", selectedLanguage);

      const response = await axios.post(
        "http://localhost:5000/api/summarize",
        formData,
        { responseType: "blob" }
      );

      const pdfText = await new Response(response.data).text();
      setSummaryText(pdfText);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `summary-${eventId}.pdf`;
      link.click();
    } catch (err) {
      setError(err.response?.data?.error || "Processing failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold mb-4 text-center">
        AI Audio Summarization
      </h1>
      <p className="mb-6 text-center max-w-2xl text-gray-300">
        Upload an audio file (MP3, WAV, etc.) or paste a URL (e.g., YouTube link
        that returns audio) to generate an AI summary. You can choose the
        language of the summary below.
      </p>

      <div className="w-full max-w-2xl bg-gray-800 p-6 rounded-lg">
        <div className="mb-6">
          <label className="block text-lg mb-2">
            Upload the audio recording of your event:
          </label>
          <div
            className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-purple-500 transition-colors"
            onClick={() => document.getElementById("fileInput").click()}
          >
            <FiUpload className="text-3xl mb-2 text-gray-400" />
            <p className="text-gray-400">
              Click to upload or drop an audio file
            </p>
          </div>
          <input
            type="file"
            id="fileInput"
            accept="audio/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {audioPreview && (
          <div className="mb-6">
            <p className="mb-2 text-lg">Audio Preview:</p>
            <audio
              src={audioPreview}
              controls
              className="w-full max-h-20 rounded-lg"
            />
          </div>
        )}

        <div className="mb-6">
          <label className="block text-lg mb-2">Or Enter URL:</label>
          <input
            type="text"
            value={inputURL}
            onChange={(e) => setInputURL(e.target.value)}
            placeholder="https://youtube.com/..."
            className="w-full p-2 bg-gray-700 rounded focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="mb-6">
          <label className="block text-lg mb-2">Select Language:</label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded focus:ring-2 focus:ring-purple-500"
          >
            <option value="English">English</option>
            <option value="Yoruba">Yoruba</option>
            <option value="Arabic">Arabic</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            {/* Add additional languages as needed */}
          </select>
        </div>

        <button
          onClick={handleSummarize}
          disabled={loading}
          className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium transition-colors"
        >
          {loading ? "Analyzing Content..." : "Generate Summary"}
        </button>

        {summaryText && (
          <div className="mt-6 p-4 bg-gray-700 rounded-lg">
            <h2 className="text-xl font-bold mb-4">AI Summary</h2>
            <div className="whitespace-pre-wrap text-gray-200 mb-4">
              {summaryText}
            </div>
            <button
              onClick={() => {
                const blob = new Blob([summaryText], { type: "text/plain" });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `summary-${eventId}.txt`;
                link.click();
              }}
              className="text-sm bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded"
            >
              Download Text
            </button>
          </div>
        )}

        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default SummarizedVideoPage;
