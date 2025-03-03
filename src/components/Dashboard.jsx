import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Chart from "react-apexcharts";
import axios from "axios";

const Dashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [videoSummary, setVideoSummary] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [chartData, setChartData] = useState({
    series: [
      {
        name: "Revenue",
        data: [],
      },
      {
        name: "Tickets Sold",
        data: [],
      },
    ],
    options: {
      chart: { type: "line", height: 350 },
      xaxis: { categories: [] },
      stroke: { curve: "smooth" },
      dataLabels: { enabled: false },
      title: {
        text: "Event Performance Over Time",
        align: "center",
        style: { fontSize: "20px" },
      },
    },
  });

  // Fetch events on load if user is authenticated.
  useEffect(() => {
    if (user) {
      fetchUserEvents();
    }
  }, [user]);

  // Fetch user-created events from Firestore.
  const fetchUserEvents = async () => {
    const q = query(
      collection(db, "events"),
      where("creatorId", "==", user.uid)
    );
    const querySnapshot = await getDocs(q);
    let ticketCount = 0;
    let revenue = 0;
    const eventList = [];

    querySnapshot.forEach((doc) => {
      const event = doc.data();
      eventList.push({ id: doc.id, ...event });
      ticketCount += event.ticketsSold || 0;
      revenue += event.revenue || 0;
    });

    setEvents(eventList);
    setTotalTickets(ticketCount);
    setTotalRevenue(revenue);
    updateChartData(eventList);
  };

  // Update the chart data based on events list.
  // Here we assume each event has a "date" field and metrics for revenue and ticketsSold.
  const updateChartData = (eventList) => {
    // Sort events by date (assuming ISO string date format)
    const sortedEvents = eventList.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    const categories = sortedEvents.map((event) =>
      new Date(event.date).toLocaleDateString()
    );
    const revenueData = sortedEvents.map((event) => event.revenue || 0);
    const ticketsData = sortedEvents.map((event) => event.ticketsSold || 0);

    setChartData((prevData) => ({
      ...prevData,
      series: [
        { name: "Revenue", data: revenueData },
        { name: "Tickets Sold", data: ticketsData },
      ],
      options: { ...prevData.options, xaxis: { categories } },
    }));
  };

  // Handle file upload for video summarization.
  const handleFileUpload = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Video summarization using AssemblyAI (free tier available with rate limits).
  const handleVideoSummarization = async () => {
    if (!selectedFile) return;

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Step 1: Upload the video to AssemblyAI.
      const uploadResponse = await axios.post(
        "https://api.assemblyai.com/v2/upload",
        formData,
        {
          headers: { Authorization: "YOUR_API_KEY" },
        }
      );
      const uploadUrl = uploadResponse.data.upload_url;

      // Step 2: Request transcription with summarization.
      const summaryResponse = await axios.post(
        "https://api.assemblyai.com/v2/transcript",
        { audio_url: uploadUrl, summarization: true },
        { headers: { Authorization: "YOUR_API_KEY" } }
      );
      const transcriptId = summaryResponse.data.id;

      // Step 3: Poll the transcript endpoint until complete.
      let completed = false;
      while (!completed) {
        const transcriptResult = await axios.get(
          `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
          { headers: { Authorization: "YOUR_API_KEY" } }
        );
        if (transcriptResult.data.status === "completed") {
          setVideoSummary(transcriptResult.data.summary);
          completed = true;
        } else {
          // Wait for a few seconds before polling again.
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }
    } catch (error) {
      console.error("Error during video summarization", error);
      setVideoSummary(
        "An error occurred during summarization. Please try again."
      );
    }
  };

  return (
    <div className="dashboard-page bg-black min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-purple-400 text-center">
          Welcome, {user?.email.split("@")[0]}!
        </h2>
        <div className="text-center mt-4">
          <Link
            to="/create-event"
            className="py-2 px-4 bg-green-600 hover:bg-green-500 rounded-lg text-white"
          >
            Create New Event
          </Link>
        </div>
      </header>

      {/* Analytics Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
        <div className="p-6 bg-gray-800 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-bold">Total Tickets Sold</h3>
          <p className="text-4xl text-green-400 font-bold">{totalTickets}</p>
        </div>
        <div className="p-6 bg-gray-800 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-bold">Total Revenue</h3>
          <p className="text-4xl text-yellow-400 font-bold">${totalRevenue}</p>
        </div>
        <div className="p-6 bg-gray-800 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-bold">Total Events</h3>
          <p className="text-4xl text-blue-400 font-bold">{events.length}</p>
        </div>
      </section>

      {/* Chart Section */}
      <section className="mt-12 bg-gray-900 p-6 rounded-lg text-white">
        <h3 className="text-2xl font-bold text-center mb-6">
          Event Performance Overview
        </h3>
        <Chart
          options={chartData.options}
          series={chartData.series}
          type="line"
          height={350}
        />
      </section>

      {/* Upcoming Events List */}
      <section className="mt-12 bg-gray-900 p-6 rounded-lg text-white">
        <h3 className="text-2xl font-bold mb-4">Your Events</h3>
        {events.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left">Event Name</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Tickets Sold</th>
                  <th className="px-6 py-3 text-left">Revenue</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {events.map((event) => (
                  <tr key={event.id}>
                    <td className="px-6 py-4">{event.name}</td>
                    <td className="px-6 py-4">
                      {new Date(event.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">{event.ticketsSold || 0}</td>
                    <td className="px-6 py-4">${event.revenue || 0}</td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/events/${event.id}`}
                        className="text-blue-400 hover:underline"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400">No events created yet.</p>
        )}
      </section>

      {/* Video Summarization */}
      <section className="mt-12 bg-gray-900 p-6 rounded-lg text-white">
        <h3 className="text-2xl font-bold mb-4">Video Summarization</h3>
        <p className="mb-2 text-gray-300">
          Upload your event recording to generate an AI-powered summary.
        </p>
        <input
          type="file"
          onChange={handleFileUpload}
          className="mb-4 block text-gray-300"
        />
        <button
          onClick={handleVideoSummarization}
          className="py-2 px-4 bg-blue-600 hover:bg-blue-500 rounded-lg text-white mt-2"
        >
          Upload & Summarize Video
        </button>
        {videoSummary && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <h4 className="text-lg font-bold">Summary:</h4>
            <p className="text-gray-300">{videoSummary}</p>
          </div>
        )}
        {isCreator && (
  <li>
    <Link
      to={`/events/${eventId}/payment-details`}
      className="block py-2 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-2"
    >
      <FaWallet size={20} className="text-white" />
      Payment Details
    </Link>
  </li>
)}

      </section>
    </div>
  );
};

export default Dashboard;