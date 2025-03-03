import React, { useState, useEffect, useRef } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import EventCard from "../src/components/EventCard";
import EventCardSkeleton from "../src/components/Skeletons/EventCardSkeleton";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { FaAngleUp, FaAngleDown } from "react-icons/fa";

const Events = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [distanceFilter, setDistanceFilter] = useState("");

  // Mobile top bar toggle (default false so inputs are hidden on mobile)
  const [topBarOpen, setTopBarOpen] = useState(false);

  // New state to detect if screen is mobile (width < 768px)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Update isMobile on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Carousel dot indicator
  const carouselRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const cardWidth = 300 + 24; // 300px width + gap

  useEffect(() => {
    const q = query(collection(db, "events"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventData);
      setLoadingEvents(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting geolocation:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filteredEvents = events
    .filter((event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((event) =>
      event.location?.address
        ?.toLowerCase()
        .includes(locationFilter.toLowerCase())
    )
    .filter((event) => {
      if (!distanceFilter || !userLocation || !event.location?.coordinates) {
        return true;
      }
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        event.location.coordinates.latitude,
        event.location.coordinates.longitude
      );
      return distance <= parseFloat(distanceFilter);
    });

  const sortedEvents = filteredEvents.slice().sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const recentEvents = sortedEvents.slice(0, 5);
  const gridEvents = sortedEvents.slice(5);

  const handleDashboardClick = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  const handleCreateEventClick = () => {
    if (user) {
      navigate("/create-event-form");
    } else {
      navigate("/login");
    }
  };

  const handleCarouselScroll = () => {
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const slideIndex = Math.round(scrollLeft / cardWidth);
      setCurrentSlide(slideIndex);
    }
  };

  const numDots = recentEvents.length;

  return (
    <div className="events-page bg-black min-h-screen py-8 font-roboto">
      {/* Container with responsive horizontal padding */}
      <div className="container mx-auto px-4 md:px-8">
        {/* Fixed Header Section */}
        <div className="top-0 left-0 right-0 z-50 bg-black bg-opacity-95 border-b border-white p-4 shadow-md">
          <div className="flex items-center justify-between">
            {/* Mobile Toggle Button (only icon) */}
            <button
              onClick={() => setTopBarOpen((prev) => !prev)}
              className="text-white md:hidden flex items-center focus:outline-none"
            >
              {topBarOpen ? (
                <FaAngleUp className="text-3xl" />
              ) : (
                <FaAngleDown className="text-3xl" />
              )}
            </button>
            {/* Search Inputs: Render ONLY if not mobile */}
            {!isMobile && (
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    placeholder="Search by event title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="py-3 px-4 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary flex-grow min-w-[200px]"
                  />
                  <input
                    type="text"
                    placeholder="Filter by location..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="py-3 px-4 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary flex-grow min-w-[200px]"
                  />
                  <input
                    type="number"
                    placeholder="Distance (km)"
                    value={distanceFilter}
                    onChange={(e) => setDistanceFilter(e.target.value)}
                    className="py-3 px-4 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary w-[150px]"
                  />
                </div>
              </div>
            )}
            {/* Right Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleDashboardClick}
                className="py-1 p-6 px-2 sm:py-2 sm:px-3 md:py-3 md:px-6 lg:py-4 lg:px-8 text-xs sm:text-sm md:text-base lg:text-lg bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors duration-300"
              >
                View Dashboard
              </button>
              <button
                onClick={handleCreateEventClick}
                className="py-1 p-6 px-2 sm:py-2 sm:px-3 md:py-3 md:px-6 lg:py-4 lg:px-8 text-xs sm:text-sm md:text-base lg:text-lg bg-green-600 hover:bg-green-500 rounded-lg font-medium transition-colors duration-300 text-black"
              >
                Create Event
              </button>
            </div>
          </div>
          {/* Mobile search inputs block removed so no search bars on mobile */}
          {/*
          {topBarOpen && (
            <div className="mt-4 flex flex-wrap items-center gap-4 md:hidden">
              ...mobile search inputs...
            </div>
          )}
          */}
        </div>

        {/* Spacer for fixed header */}
        <div className="h-9"></div>

        {/* Latest Event Carousel Section */}
        <div
          className="rounded-lg mb-8"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 34px, #9dedf0 1px), repeating-linear-gradient(90deg, transparent, transparent 34px, #33bbcf 1px)",
          }}
        >
          <div className="text-2xl font-bold text-purple-400 px-8 mb-4">
            Latest Events
          </div>
          {loadingEvents ? (
            <div className="flex flex-nowrap gap-6 overflow-x-auto pb-4 no-scrollbar">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="min-w-[300px] flex-shrink-0 px-2 mx-2"
                >
                  <EventCardSkeleton />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div
                ref={carouselRef}
                onScroll={handleCarouselScroll}
                className="w-full flex gap-6 overflow-x-auto no-scrollbar px-4 justify-center"
                style={{
                  scrollBehavior: "smooth",
                  scrollSnapType: "x mandatory",
                }}
              >
                {recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex-shrink-0 w-[380px] px-2 mx-2"
                    style={{ scrollSnapAlign: "center" }}
                  >
                    <EventCard eventId={event.id} />
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-4">
                {Array.from({ length: numDots }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full mx-1 transition-all ${
                      currentSlide === i ? "bg-white scale-125" : "bg-gray-500"
                    }`}
                  ></div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Older Events Grid Section */}
        {loadingEvents ? (
          <div className="w-full grid grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <EventCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          gridEvents.length > 0 && (
            <div className="w-full mb-8 mx-auto px-4 md:px-8">
              <h2 className="text-2xl font-bold text-purple-400 mb-4">
                Older Events
              </h2>
              <div className="w-full align-middle grid grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
                {gridEvents.map((event) => (
                  <EventCard key={event.id} eventId={event.id} />
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Events;
