// Updated RegisterModal.js
import React, { useState, useEffect } from "react";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../config/firebase";
import { FaCheckCircle } from "react-icons/fa";

const RegisterModal = ({ eventId, onClose }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [error, setError] = useState("");
  const [customSuccess, setCustomSuccess] = useState(false);
  const navigate = useNavigate();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login");
    }
  }, [auth.currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !whatsapp) {
      setError("Please fill in all fields.");
      return;
    }
    try {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }
      // Create a document in the 'attendees' subcollection with the user's UID
      await setDoc(doc(db, "events", eventId, "attendees", user.uid), {
        name,
        email,
        whatsapp,
        registeredAt: new Date(),
      });
      setCustomSuccess(true);
      setError("");
      // Hide the success popup and close the modal after 2 seconds
      setTimeout(() => {
        setCustomSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error registering attendee:", error);
      setError("Failed to register. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-black text-white p-6 rounded-lg shadow-lg w-96">
        {/* Custom Success Popup */}
        {customSuccess && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-4 bg-black p-4 rounded shadow-lg flex items-center">
            <FaCheckCircle className="text-green-500 mr-2" />
            <span className="text-green-500">Registration successful!</span>
          </div>
        )}
        <h2 className="text-2xl font-bold mb-4">Register for Event</h2>
        <form onSubmit={handleSubmit}>
          {/* Name Input */}
          <div className="mb-4">
            <label className="block text-white font-bold mb-2">Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-black text-white border-0 border-b border-gray-600 focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          {/* Email Input */}
          <div className="mb-4">
            <label className="block text-white font-bold mb-2">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-black text-white border-0 border-b border-gray-600 focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          {/* WhatsApp Input */}
          <div className="mb-4">
            <label className="block text-white font-bold mb-2">
              WhatsApp Number:
            </label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full px-3 py-2 bg-black text-white border-0 border-b border-gray-600 focus:outline-none focus:border-purple-500"
              placeholder="+234 812 345 6789"
              required
            />
          </div>

          {/* Error Message */}
          {error && <div className="mb-4 text-red-500">{error}</div>}

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-md"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;
