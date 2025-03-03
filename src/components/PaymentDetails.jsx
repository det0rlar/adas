// src/pages/PaymentDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import Chart from "react-apexcharts";
import Sidebar from "./Sidebar";

const PaymentDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch event data from Firestore
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const eventDoc = await getDoc(doc(db, "events", eventId));
        if (eventDoc.exists()) {
          setEventData({ id: eventDoc.id, ...eventDoc.data() });
        } else {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching event data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventId, navigate]);

  // Configure a simple bar chart for Revenue
  const chartData = {
    series: [
      {
        name: "Revenue",
        data: eventData ? [eventData.revenue || 0] : [],
      },
    ],
    options: {
      chart: { type: "bar", height: 350 },
      title: {
        text: "Event Revenue",
        align: "center",
        style: { fontSize: "20px" },
      },
      xaxis: {
        categories: eventData ? [eventData.title] : [],
      },
      dataLabels: { enabled: true },
    },
  };

  if (loading) {
    return (
      <div className="text-center text-gray-400 p-4">
        Loading Payment Details...
      </div>
    );
  }
  if (!eventData) {
    return <div className="text-center text-red-500 p-4">Event not found.</div>;
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Left Sidebar */}
      <Sidebar eventId={eventId} />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-purple-400 text-center">
            Payment Details for {eventData.title}
          </h2>
        </header>

        {/* Analytics Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 bg-gray-800 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-bold">Total Revenue</h3>
            <p className="text-4xl text-yellow-400 font-bold">
              ${eventData.revenue || 0}
            </p>
          </div>
          <div className="p-6 bg-gray-800 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-bold">Tickets Sold</h3>
            <p className="text-4xl text-green-400 font-bold">
              {eventData.ticketsSold || 0}
            </p>
          </div>
        </section>

        {/* Chart Section */}
        <section className="mb-8 bg-gray-900 p-6 rounded-lg">
          <Chart
            options={chartData.options}
            series={chartData.series}
            type="bar"
            height={350}
          />
        </section>

        {/* Navigation Buttons */}
        <section className="flex flex-col md:flex-row justify-center gap-4">
          <a
            href="https://dashboard.paystack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-4 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-center"
          >
            View Paystack Dashboard
          </a>
          <Link
            to="/dashboard"
            className="py-2 px-4 bg-green-600 hover:bg-green-500 rounded-lg text-white text-center"
          >
            Back to Dashboard
          </Link>
        </section>
      </div>
    </div>
  );
};

export default PaymentDetails;
