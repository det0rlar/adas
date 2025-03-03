const express = require("express");
const router = express.Router();
const { initializePayment } = require("../../utils/paystack");
const { fetchTicketFromFirestore } = require("../config/firestore");

router.post("/initiate-payment", async (req, res) => {
  const { eventId, ticketId, quantity } = req.body;

  try {
    // Fetch ticket details from Firestore
    const ticket = await fetchTicketFromFirestore(eventId, ticketId);

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    if (ticket.isUnlimited === false && ticket.quantity < quantity) {
      return res.status(400).json({ error: "Not enough tickets available" });
    }

    // Calculate total amount
    const totalAmount = ticket.price * quantity * 100; // Paystack requires amount in kobo

    // Initialize Paystack payment
    const paymentUrl = await initializePayment({
      amount: totalAmount,
      email: req.user.email, // Use authenticated user's email
      metadata: {
        eventId,
        ticketId,
        userId: req.user.uid,
        quantity,
      },
    });

    if (paymentUrl) {
      res.json({ paymentUrl });
    } else {
      res.status(500).json({ error: "Failed to initialize payment" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

const { verifyPayment, saveTicketToFirestore } = require("../utils/paystack");

router.post("/verify-payment", async (req, res) => {
  const { reference } = req.body;

  try {
    // Verify payment with Paystack
    const paymentResponse = await verifyPayment(reference);

    if (paymentResponse.status && paymentResponse.data.status === "success") {
      const { eventId, ticketId, userId, quantity } =
        paymentResponse.data.metadata;

      // Save ticket data to Firestore
      await saveTicketToFirestore(eventId, ticketId, userId, quantity);

      // Redirect to ticket page
      res.json({
        success: true,
        ticketPageUrl: `/ticket?orderId=${reference}&ticketId=${ticketId}`,
      });
    } else {
      res.status(400).json({ error: "Payment verification failed" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
