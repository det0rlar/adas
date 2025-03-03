// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.cleanupOldEvents = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const eventsSnapshot = await admin.firestore().collection("events").get();

    eventsSnapshot.forEach(async (eventDoc) => {
      const event = eventDoc.data();
      if (new Date(event.endTime) < threeDaysAgo) {
        await admin.firestore().collection("events").doc(eventDoc.id).delete();
        // Delete image from ImgBB using their API
      }
    });
  });
