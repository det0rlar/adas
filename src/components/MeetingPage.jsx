import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { FaCopy, FaCheck, FaVideo } from "react-icons/fa";

const MeetingPage = () => {
  const { eventId } = useParams();
  const containerRef = useRef(null);
  const [isCopied, setIsCopied] = useState(false);
  const [jwtToken, setJwtToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const roomName = `adas-event-${eventId}`;
  const meetingUrlDisplay = `https://meet.jit.si/${roomName}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(meetingUrlDisplay);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 5000);
  };

  useEffect(() => {
    // Fetch JWT Token from backend
    const fetchJwtToken = async () => {
      try {
        console.log("Fetching JWT Token...");
        const response = await fetch("http://localhost:5000/api/generate-jwt");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (data.token) {
          console.log("JWT Token fetched successfully:", data.token);
          setJwtToken(data.token);
        } else {
          console.error("JWT Token fetch failed:", data);
        }
      } catch (error) {
        console.error("Error fetching JWT:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJwtToken();
  }, []);

  useEffect(() => {
    if (!jwtToken) return;
    const startMeeting = () => {
      if (containerRef.current) {
        const options = {
          roomName,
          width: "100%",
          height: 700,
          parentNode: containerRef.current,
          configOverwrite: {
            enableWelcomePage: false,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_POWERED_BY: false,
            TOOLBAR_BUTTONS: [
              "microphone",
              "camera",
              "desktop",
              "fullscreen",
              "chat",
              "settings",
              "raisehand",
              "videoquality",
              "invite",
              "tileview",
              "mute-everyone",
              "security",
            ],
          },
          jwt: jwtToken,
        };
        new window.JitsiMeetExternalAPI("8x8.vc", options);
      }
    };

    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = startMeeting;
      script.onerror = () =>
        console.error("Failed to load Jitsi Meet API script");
      document.body.appendChild(script);
    } else {
      startMeeting();
    }
  }, [jwtToken, roomName]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-6 bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <FaVideo className="text-3xl text-purple-400" />
            <div>
              <h1 className="text-2xl font-bold">Live Meeting Session</h1>
              <p className="text-sm text-gray-400 mt-1">
                Event ID:{" "}
                <span className="font-mono text-purple-300">{eventId}</span>
              </p>
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-3 border border-purple-500">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300 truncate flex-1">
                {meetingUrlDisplay}
              </span>
              <button
                onClick={copyToClipboard}
                className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
              >
                {isCopied ? <FaCheck className="text-green-400" /> : <FaCopy />}
                <span className="text-sm hidden sm:block">
                  {isCopied ? "Copied!" : "Copy Link"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div
          ref={containerRef}
          className="rounded-xl overflow-hidden shadow-2xl border border-gray-800"
          style={{ height: "700px" }}
        >
          {loading ? (
            <div className="h-full w-full bg-gray-900 flex items-center justify-center">
              <span className="animate-pulse text-gray-500">
                Fetching JWT Token...
              </span>
            </div>
          ) : (
            <div className="h-full w-full bg-gray-900 flex items-center justify-center">
              <span className="animate-pulse text-gray-500">
                Starting meeting...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingPage;
