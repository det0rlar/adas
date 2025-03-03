// components/Dashboard.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";
import EventCard from "../src/components/EventCard";
import {
  FaComments,
  FaVideo,
  FaCloudUploadAlt,
  FaFilePdf,
  FaPlus,
  FaWallet,
  FaArrowLeft,
  FaBars, // Hamburger icon for mobile
  FaTimes, // Close icon for mobile sidebar
  FaChartBar, // New icon for "View Dashboard"
} from "react-icons/fa";

const Dashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch only events created by the logged-in user.
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "events"),
      where("creatorId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Toggle discussion enabled status for a given event.
  const toggleDiscussion = async (eventId, currentStatus) => {
    try {
      await updateDoc(doc(db, "events", eventId), {
        discussionEnabled: !currentStatus,
      });
    } catch (error) {
      console.error("Error toggling discussion:", error);
    }
  };

  return (
    <div className="dashboard min-h-screen z-[9999] flex bg-gray-900 text-white">
      {/* Sidebar */}
      <div>
        {/* Mobile Hamburger Icon */}
        <div className="md:hidden p-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-purple-400 focus:outline-none"
          >
            <FaBars size={24} />
          </button>
        </div>
        {/* Sidebar Overlay for Mobile & Desktop */}
        <div
          className={`
            ${sidebarOpen ? "fixed inset-0 w-54" : "hidden"} 
            md:block bg-gray-800 p-4 border-r border-gray-700 
            top-0 left-0 h-full z-50 shadow-lg transition-all duration-300
          `}
        >
          {/* Mobile: Close button */}
          <div className="md:hidden flex justify-end">
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-purple-400 focus:outline-none"
            >
              <FaTimes size={24} />
            </button>
          </div>

          <div className="flex flex-col h-full">
            <Link to="/events" className="mb-8">
              <button className="w-full flex items-center gap-3 text-purple-400 hover:text-purple-300 p-2 rounded-lg transition-colors">
                <FaArrowLeft className="text-xl" />
                <span className="text-sm font-semibold">Back to Events</span>
              </button>
            </Link>

            <h2 className="text-xl font-bold mb-6 text-purple-400">
              Creator Tools
            </h2>
            <nav className="space-y-3 flex-1">
              <Link
                to="/create-event-form"
                className="flex items-center gap-4 p-3 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FaPlus className="text-purple-400 text-xl" />
                <span className="text-sm">New Event</span>
              </Link>
              <Link
                to="/live-stream"
                className="flex items-center gap-4 p-3 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FaVideo className="text-purple-400 text-xl" />
                <span className="text-sm">Live Stream</span>
              </Link>
              <Link
                to="/uploads"
                className="flex items-center gap-4 p-3 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FaCloudUploadAlt className="text-purple-400 text-xl" />
                <span className="text-sm">Uploads</span>
              </Link>
              {/* New Buttons: Contact Us and Settings */}
              <Link
                to="/contact-us"
                className="flex items-center gap-4 p-3 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FaWallet className="text-purple-400 text-xl" />
                <span className="text-sm">Contact Us</span>
              </Link>
              <Link
                to="/settings"
                className="flex items-center gap-4 p-3 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FaWallet className="text-purple-400 text-xl" />
                <span className="text-sm">Settings</span>
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-3xl font-bold mb-8 text-purple-400">My Events</h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No events created yet.</p>
            <Link
              to="/create-event-form"
              className="mt-4 inline-block bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-lg transition-colors text-sm font-medium"
            >
              Create New Event
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-gray-800 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row h-full">
                  {/* Event Image (using the EventCard component) */}
                  <div className="w-full md:w-1/3">
                    <EventCard eventId={event.id} />
                  </div>

                  {/* Right Side - Action Buttons & Analytics */}
                  <div className="w-full md:w-2/3 p-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      <button
                        onClick={() =>
                          toggleDiscussion(event.id, event.discussionEnabled)
                        }
                        className={`w-full flex items-center gap-4 p-4 rounded-lg transition-colors ${
                          event.discussionEnabled
                            ? "bg-green-600 hover:bg-green-500"
                            : "bg-red-600 hover:bg-red-500"
                        }`}
                      >
                        <FaComments className="flex-shrink-0 text-xl" />
                        <span className="text-sm truncate">
                          {event.discussionEnabled
                            ? "Disable Discussion"
                            : "Enable Discussion"}
                        </span>
                      </button>

                      {/* Payment Details & Paystack Dashboard */}
                      <div className="space-y-4">
                        <Link
                          to={`/events/${event.id}/payment-details`}
                          className="block py-2 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <FaWallet size={20} className="text-white" />
                          <span className="text-sm">Payment Details</span>
                        </Link>
                        <a
                          href="https://dashboard.paystack.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block py-2 px-4 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <FaWallet size={20} className="text-white" />
                          <span className="text-sm">Paystack Dashboard</span>
                        </a>
                      </div>
                      <Link
                        to={`/events/${event.id}/live-stream`}
                        className="block py-2 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <FaVideo className="flex-shrink-0 text-xl" />
                        <span className="text-sm">Go Live</span>
                      </Link>

                      <Link
                        to={`/events/${event.id}/summarized-video`}
                        className="block w-full flex items-center gap-4 p-4 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
                      >
                        <FaCloudUploadAlt className="flex-shrink-0 text-xl" />
                        <span className="text-sm">Upload Recording</span>
                      </Link>

                      {/* New "View Dashboard" Button */}
                      <Link
                        to={`/events/${event.id}/marketing`}
                        className="block w-full flex items-center gap-4 p-4 bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors"
                      >
                        <FaChartBar className="flex-shrink-0 text-xl" />
                        <span className="text-sm">View Dashboard</span>
                      </Link>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <p className="text-xs text-gray-400 truncate">
                        Created:{" "}
                        {new Date(event.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        Tickets sold: {event.ticketsSold || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
