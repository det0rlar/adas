// pages/QAChatRoomPage.jsx
import React from "react";
import { useParams, Link } from "react-router-dom";
import QAChatRoom from "../src/components/QAChatRoom";

const QAChatRoomPage = () => {
  const { eventId } = useParams();

  return (
    <div className="min-h-screen bg-gray-800 text-white p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Q&A Chat Room</h1>
        <Link to={`/events/${eventId}`} className="text-blue-400 hover:text-blue-300">
          Back to Event
        </Link>
      </header>
      <QAChatRoom isAdmin={true} themeStyles={{ padding: "1rem" }} />
    </div>
  );
};

export default QAChatRoomPage;
