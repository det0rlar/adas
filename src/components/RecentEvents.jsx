// components/RecentEvents.js
import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import EventCard from "./EventCard";

const RecentEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "events"),
      orderBy("createdAt", "desc"),
      limit(5) // Display only the 5 most recent events
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
  }, []);

  if (loading) {
    return <p>Loading recent events...</p>;
  }

  return (
    <div className="recent-events">
      <h2>Upcoming Events Near You</h2>
      {events.length > 0 ? (
        <div className="event-list">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p>No upcoming events found.</p>
      )}
    </div>
  );
};

export default RecentEvents;
