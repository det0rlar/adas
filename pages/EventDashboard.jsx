// components/EventDashboard.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const EventDashboard = () => {
  const { eventId } = useParams();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch event data from Firestore
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const eventDoc = await getDoc(doc(db, "events", eventId));
        if (eventDoc.exists()) {
          setEventData({ id: eventDoc.id, ...eventDoc.data() });
        }
      } catch (error) {
        console.error("Error fetching event data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        <p>Event not found.</p>
      </div>
    );
  }

  // Sample data for the Tickets Sales chart (dummy data)
  const salesData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Tickets Sold",
        data: [12, 19, 3, 5, 2, 3, 10],
        backgroundColor: "rgba(75,192,192,0.6)",
      },
    ],
  };

  // Pie chart data for ticket types distribution
  const tickets = eventData.tickets || [];
  const pieData = {
    labels: tickets.map((ticket) => ticket.ticketName),
    datasets: [
      {
        data: tickets.map((ticket) => ticket.quantity || 0),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
        ],
      },
    ],
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">
        Dashboard for {eventData.title}
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Tickets Sales */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">
            Tickets Sales (Last 7 Days)
          </h2>
          <Bar
            data={salesData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Tickets Sold Over Time" },
              },
            }}
          />
        </div>

        {/* Pie Chart: Ticket Types Distribution */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">
            Ticket Types Distribution
          </h2>
          <Pie
            data={pieData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "bottom" },
                title: {
                  display: true,
                  text: "Ticket Types Distribution",
                },
              },
            }}
          />
        </div>
      </div>

      {/* Additional Event Details */}
      <div className="mt-6 bg-gray-800 p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Event Details</h2>
        <ul className="list-disc ml-5">
          <li>
            <strong>Description:</strong> {eventData.description}
          </li>
          <li>
            <strong>Event Type:</strong> {eventData.eventType}
          </li>
          <li>
            <strong>Language:</strong> {eventData.language}
          </li>
          <li>
            <strong>Platform:</strong> {eventData.platform}
          </li>
          <li>
            <strong>Start Time:</strong>{" "}
            {new Date(eventData.startTime).toLocaleString()}
          </li>
          <li>
            <strong>End Time:</strong>{" "}
            {new Date(eventData.endTime).toLocaleString()}
          </li>
          <li>
            <strong>Tickets Sold:</strong> {eventData.ticketsSold || 0}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default EventDashboard;
