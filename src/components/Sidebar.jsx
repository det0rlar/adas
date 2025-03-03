// src/components/Sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaChartBar, FaWallet, FaBullhorn, FaArrowLeft } from "react-icons/fa";

const Sidebar = ({ eventId }) => {
  return (
    <div className="min-h-screen">
      <div className="mb-8 mt-20">
        <Link
          to="/dashboard"
          className="flex items-center text-purple-400 hover:text-purple-300"
        >
          <FaArrowLeft className="mr-2 " />
          Back to Dashboard
        </Link>
      </div>
      <nav className="space-y-4">
        <Link
          to={`/events/${eventId}/payment-details`}
          className="block px-3 py-2 hover:bg-gray-700 rounded"
        >
          <FaWallet className="inline mr-2" />
          Payment Details
        </Link>
        <Link
          to={`/events/${eventId}/dashboard`}
          className="block px-3 py-2 hover:bg-gray-700 rounded"
        >
          <FaChartBar className="inline mr-2" />
          Event Analytics
        </Link>
        <Link
          to={`/events/${eventId}/marketing`}
          className="block px-3 py-2 hover:bg-gray-700 rounded"
        >
          <FaBullhorn className="inline mr-2" />
          Event Marketing
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
