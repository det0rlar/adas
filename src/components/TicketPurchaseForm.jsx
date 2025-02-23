import React, { useState } from "react";
import axios from "axios";

const TicketPurchaseForm = ({ eventId, ticketData }) => {
  const [quantity, setQuantity] = useState(1);
  const [paymentUrl, setPaymentUrl] = useState(null);

  const handlePurchase = async () => {
    try {
      const response = await axios.post("/api/initiate-payment", {
        eventId,
        ticketId: ticketData.id,
        quantity,
      });
      if (response.data.paymentUrl) {
        setPaymentUrl(response.data.paymentUrl); // Redirect to Paystack payment page
      }
    } catch (error) {
      console.error("Error initiating payment:", error.message);
    }
  };

  return (
    <div className="ticket-purchase-form bg-primary p-8 rounded-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-white mb-4">Buy Tickets</h2>
      <p className="text-white mb-4">{ticketData.name}</p>
      <p className="text-white mb-4">Price: ${ticketData.price}</p>
      <p className="text-white mb-4">
        Available Tickets: {ticketData.quantity || "Unlimited"}
      </p>
      <p className="text-white mb-4">
        Maximum Tickets per User: {ticketData.purchaseLimit}
      </p>

      {/* Quantity Input */}
      <div className="mb-4">
        <label className="block text-white font-medium mb-2">Quantity</label>
        <input
          type="number"
          min="1"
          max={ticketData.purchaseLimit}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full py-4 px-6 rounded-lg bg-gray-800 text-white placeholder:text-dimWhite focus:outline-none focus:ring-2 focus:ring-secondary"
        />
      </div>

      {/* Purchase Button */}
      <button
        onClick={handlePurchase}
        className="w-full py-4 bg-secondary rounded-lg font-medium text-black hover:bg-green-500 transition-colors duration-300"
      >
        Buy Now
      </button>

      {/* Redirect to Payment URL */}
      {paymentUrl && (
        <div className="mt-6">
          <a
            href={paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:text-white transition-colors duration-300"
          >
            Click here to complete payment
          </a>
        </div>
      )}
    </div>
  );
};

export default TicketPurchaseForm;
