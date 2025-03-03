const paystack = require("paystack-api")(
  import.meta.env.VITE_PAYSTACK_SECRET_KEY
);

// Initialize payment
async function initializePayment(payload) {
  try {
    const response = await paystack.transactions.initialize(payload);
    return response.status ? response.data.authorization_url : null;
  } catch (error) {
    console.error("Error initializing payment:", error);
    return null;
  }
}

// Verify payment
async function verifyPayment(reference) {
  try {
    const response = await paystack.transactions.verify({ reference });
    return response;
  } catch (error) {
    console.error("Error verifying payment:", error);
    return null;
  }
}

// Save ticket data to Firestore
async function saveTicketToFirestore(eventId, ticketId, userId, quantity) {
  const db = require("../config/firebase").db;

  const eventRef = db.collection("events").doc(eventId);

  // Update ticketsSold count
  await eventRef.update({
    ticketsSold:
      require("firebase-admin").firestore.FieldValue.increment(quantity),
  });

  // Update specific ticket type
  await eventRef.update({
    [`tickets.${ticketId}.sold`]:
      require("firebase-admin").firestore.FieldValue.increment(quantity),
  });

  // Add attendee to the attendees subcollection
  const attendeeRef = eventRef.collection("attendees").doc(userId);
  await attendeeRef.set(
    {
      ticketId,
      orderId: reference,
      createdAt: require("firebase-admin").firestore.Timestamp.now(),
      paid: true,
    },
    { merge: true }
  );
}

module.exports = {
  initializePayment,
  verifyPayment,
  saveTicketToFirestore,
};
