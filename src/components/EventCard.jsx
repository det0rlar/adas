import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import {
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaClock,
  FaCalendarAlt,
  FaEllipsisV,
} from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";

const EventCard = ({ eventId }) => {
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventDoc = await getDoc(doc(db, "events", eventId));
        if (eventDoc.exists()) {
          setEvent(eventDoc.data());
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "events", eventId));
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 2000);
    } catch (error) {
      console.error("Error deleting event:", error);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const getEventPrice = () => {
    if (!event.tickets || event.tickets.length === 0) return "Free";
    const prices = event.tickets.map((t) => (t.isFree ? 0 : t.price));
    const minPrice = Math.min(...prices);
    return minPrice === 0 ? "Free" : `₦${minPrice}`;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    const ordinalSuffix = (day) => {
      if (day > 3 && day < 21) return "th";
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };
    return `${day}${ordinalSuffix(day)} ${month}, ${year}`;
  };

  if (loading)
    return (
      <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg text-white w-[300px] h-[200px] flex items-center justify-center">
        Loading...
      </div>
    );

  if (!event)
    return (
      <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg text-white w-[300px] h-[200px] flex items-center justify-center">
        Event not found.
      </div>
    );

  return (
    <div
      className="relative my-7 mx-4"
      style={{
        background:
          "radial-gradient(circle, #def9fa 0%, #bef3f5 20%, #9dedf0 40%, #7de7eb 60%, #5ce1e6 80%, #33bbcf 100%)",
        borderRadius: "0.5rem",
        padding: "2px",
      }}
    >
      {user && event.creatorId === user.uid && (
        <div className="absolute top-2 left-2 z-20" ref={menuRef}>
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowMenu((prev) => !prev);
            }}
            className="p-1 rounded-full hover:bg-gray-700 focus:outline-none"
          >
            <FaEllipsisV className="text-white" />
          </button>
          {showMenu && (
            <div className="absolute top-8 left-0 bg-gray-800 border border-gray-600 rounded shadow-md z-30">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowDeleteModal(true);
                  setShowMenu(false);
                }}
                className="block w-full px-4 py-2 text-sm text-red-400 hover:bg-red-600 hover:text-white"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
            <p className="mb-6">Are you sure you want to delete this event?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <Link
        to={`/event-page/${eventId}`}
        className="relative bg-black bg-opacity-80 border border-gray-700 rounded-lg w-full h-[420px] overflow-hidden shadow-md hover:shadow-lg transition-shadow flex flex-col"
      >
        <div className="relative h-[65%] w-full flex items-center justify-center bg-gray-900">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-500 text-xs">No image</div>
          )}
        </div>
        <div className="w-full h-px bg-gray-700"></div>
        <div className="h-[40%] w-full p-4 text-white text-sm flex flex-col gap-2">
          <h3 className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 truncate border-b border-white pb-1">
            {event.title}
          </h3>
          <div className="flex items-center border-b border-white pb-1">
            <FaMapMarkerAlt className="mr-2 text-gray-400" />
            <span className="truncate">{event.location?.address || "N/A"}</span>
          </div>
          <div className="flex justify-between items-center border-b border-white pb-1">
            <div className="flex items-center">
              <FaCalendarAlt className="mr-2 text-gray-400" />
              <span>
                {event.startTime ? formatDate(event.startTime) : "N/A"}
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-medium">Type:</span>
              <span className="ml-2">
                {event.eventType ? event.eventType : "N/A"}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center border-b border-white pb-1">
            <div className="flex items-center">
              <FaMoneyBillWave className="mr-2 text-gray-400" />
              <span>{getEventPrice()}</span>
            </div>
            <div className="flex items-center">
              <FaClock className="mr-2 text-gray-400" />
              {event.startTime && event.endTime ? (
                <span>
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </span>
              ) : (
                "N/A"
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default EventCard;
