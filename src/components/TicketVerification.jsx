import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";

const TicketVerification = () => {
  const [ticketId, setTicketId] = useState("");
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleVerifyTicket = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Search all events for the ticket ID
      const eventsRef = collection(db, "events");
      const q = query(eventsRef, where("attendees.ticketId", "==", ticketId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("Ticket not found");
      }

      let foundTicket;
      querySnapshot.forEach((doc) => {
        const eventData = doc.data();
        foundTicket = eventData.attendees.find((t) => t.ticketId === ticketId);
      });

      if (!foundTicket) {
        throw new Error("Invalid ticket ID");
      }

      setTicketData(foundTicket);
      alert("Ticket verified successfully!");

      // Mark ticket as validated
      await updateDoc(doc(db, "events", foundTicket.eventId), {
        attendees: arrayUnion({
          ...foundTicket,
          validated: true,
        }),
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-purple-400">Verify Ticket</h2>

      <form onSubmit={handleVerifyTicket} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-2">Ticket ID</label>
          <input
            type="text"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded text-white"
            placeholder="Enter your ticket ID"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify Ticket"}
        </button>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>

      {ticketData && (
        <div className="mt-6 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-lg font-bold mb-4 text-green-400">
            Ticket Details
          </h3>
          <div className="space-y-2">
            <p>
              <strong>Event:</strong> {ticketData.eventTitle}
            </p>
            <p>
              <strong>Ticket Holder:</strong> {ticketData.fullName}
            </p>
            <p>
              <strong>Email:</strong> {ticketData.email}
            </p>
            <p>
              <strong>Purchase Date:</strong>{" "}
              {new Date(ticketData.purchasedAt).toLocaleDateString()}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              {ticketData.validated ? "Validated ✅" : "Not Validated ❌"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketVerification;
