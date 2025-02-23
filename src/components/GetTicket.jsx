// components/GetTicket.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";
import PaystackPop from "@paystack/inline-js";
import jsPDF from "jspdf";

const GetTicket = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    quantity: 1,
    fullName: "",
    email: "",
    phone: "",
  });

  // Custom popup alert state
  // popup: { message: string, type: "success" | "error" }
  const [popup, setPopup] = useState(null);

  // Utility: Show popup alert for 3 seconds
  const showPopup = (message, type = "success") => {
    setPopup({ message, type });
    setTimeout(() => setPopup(null), 3000);
  };

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
    fetchEvent();
  }, [eventId]);

  // Verify payment via Paystack API
  const verifyPayment = async (reference, publicKey) => {
    try {
      const response = await fetch(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${publicKey}`,
          },
        }
      );
      const verification = await response.json();
      return verification.data?.status === "success";
    } catch (error) {
      console.error("Verification failed:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Validate ticket quantity
      if (
        formData.quantity < 1 ||
        (event.tickets[0].quantity !== null &&
          formData.quantity > event.tickets[0].quantity)
      ) {
        showPopup("Invalid ticket quantity", "error");
        setProcessing(false);
        return;
      }

      // Check creator payment setup
      const creatorRef = doc(db, "creators", event.creatorId);
      const creatorDoc = await getDoc(creatorRef);
      if (!creatorDoc.exists() || !creatorDoc.data().paystackPublicKey) {
        showPopup("Event creator payment setup is incomplete", "error");
        navigate("/payment-setup");
        setProcessing(false);
        return;
      }

      const publicKey = creatorDoc.data().paystackPublicKey;
      const amount = event.tickets[0].price * formData.quantity * 100;

      const paystack = new PaystackPop();
      paystack.newTransaction({
        key: publicKey,
        email: formData.email,
        amount,
        onSuccess: async (transaction) => {
          const isVerified = await verifyPayment(
            transaction.reference,
            publicKey
          );
          if (!isVerified) {
            showPopup("Payment verification failed", "error");
            setProcessing(false);
            return;
          }

          // Generate a unique ticket ID
          const ticketId = `${eventId}-${Math.random().toString(36).substr(2, 9)}`;

          // Update the event document:
          // - Add the attendee data (including ticket details)
          // - Reduce the available ticket quantity (if applicable)
          await updateDoc(doc(db, "events", eventId), {
            attendees: arrayUnion({
              userId: user.uid,
              ...formData,
              ticketId,
              transactionReference: transaction.reference,
              purchasedAt: new Date().toISOString(),
            }),
            "tickets.0.quantity":
              event.tickets[0].quantity !== null
                ? event.tickets[0].quantity - formData.quantity
                : null,
          });

          // Generate and download the PDF ticket
          await generatePDFTicket(ticketId, transaction.reference);
          showPopup("Payment successful! Ticket generated.", "success");
          navigate(`/ticket/${ticketId}`);
        },
        onCancel: () => {
          showPopup("Payment cancelled", "error");
          setProcessing(false);
        },
      });
    } catch (error) {
      console.error("Payment error:", error);
      showPopup("Payment processing failed", "error");
    } finally {
      setProcessing(false);
    }
  };

  // Generate PDF ticket using jsPDF
  const generatePDFTicket = async (ticketId, transactionReference) => {
    try {
      const pdfDoc = new jsPDF();
      pdfDoc.setFontSize(20);
      pdfDoc.text("Event Ticket", 20, 20);
      pdfDoc.setFontSize(14);
      pdfDoc.text(`Event: ${event.title}`, 20, 30);
      pdfDoc.text(`Ticket ID: ${ticketId}`, 20, 40);
      pdfDoc.text(`Order Ref: ${transactionReference}`, 20, 50);
      pdfDoc.text(`Holder: ${formData.fullName}`, 20, 60);
      pdfDoc.setFontSize(10);
      pdfDoc.text(
        `Verification Code: ${Math.floor(1000 + Math.random() * 9000)}`,
        20,
        70
      );
      pdfDoc.save(`ticket-${ticketId}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      showPopup("Ticket download failed", "error");
    }
  };

  if (loading)
    return <div className="text-center p-4">Loading event details...</div>;
  if (!event) return <div className="text-center p-4">Event not found</div>;

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg relative">
      {/* Custom Popup Alert */}
      {popup && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black px-6 py-3 rounded shadow-lg flex items-center gap-2">
          {popup.type === "success" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
          <span
            className={`text-sm ${
              popup.type === "success" ? "text-green-500" : "text-red-500"
            }`}
          >
            {popup.message}
          </span>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6 text-purple-400">
        Purchase Ticket for {event.title}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-2">Full Name</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, fullName: e.target.value }))
            }
            className="w-full p-2 bg-gray-700 rounded text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            className="w-full p-2 bg-gray-700 rounded text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Phone Number
          </label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, phone: e.target.value }))
            }
            className="w-full p-2 bg-gray-700 rounded text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Ticket Quantity{" "}
            {event.tickets[0].quantity !== null && (
              <span className="text-xs text-gray-500">
                (Max: {event.tickets[0].quantity})
              </span>
            )}
          </label>
          <input
            type="number"
            value={formData.quantity}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                quantity: Math.min(
                  parseInt(e.target.value),
                  event.tickets[0].quantity || Infinity
                ),
              }))
            }
            className="w-full p-2 bg-gray-700 rounded text-white"
            min={1}
            required
          />
        </div>

        <button
          type="submit"
          disabled={processing}
          className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 px-4 rounded disabled:opacity-50"
        >
          {processing ? "Processing..." : "Proceed to Payment"}
        </button>
      </form>
    </div>
  );
};

export default GetTicket;
