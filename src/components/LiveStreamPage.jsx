// pages/LiveStreamPage.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const LiveStreamPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  // When the user clicks "Start Live Stream", redirect to the MeetingPage.
  const handleStartStream = () => {
    navigate(`/live-meeting/${eventId}`);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Live Stream Setup</h1>
      <p className="mb-6 text-center max-w-xl">
        Click the button below to start your live meeting. Once started, you
        can share the meeting link with your attendees so that they can join and
        see each other in real time.
      </p>
      <button
        onClick={handleStartStream}
        className="py-3 px-6 bg-green-600 hover:bg-green-500 rounded-lg text-white"
      >
        Start Live Stream
      </button>
      <p className="mt-10 text-center text-gray-400">
        This will redirect you to a live meeting page powered by Jitsi Meet.
      </p>
    </div>
  );
};

export default LiveStreamPage;
