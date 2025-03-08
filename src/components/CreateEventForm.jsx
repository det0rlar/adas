import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaInfoCircle,
  FaUsers,
  FaPalette,
  FaCheck,
} from "react-icons/fa";
import { FiUpload, FiClock } from "react-icons/fi";
import uploadImageToImgBB from "../../utils/imgbb";
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "../../config/firebase";
import CreateEventFormSkeleton from "./Skeletons/CreateEventFormSkeleton";

/**
 * Helper: Return ordinal for day (e.g. 1st, 2nd, 3rd, etc.)
 */
const getOrdinal = (n) => {
  const s = ["th", "st", "nd", "rd"],
    v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const EditableField = ({
  label,
  value,
  onSave,
  isEditing,
  onEdit,
  fieldType = "text",
}) => {
  const [tempValue, setTempValue] = useState(value);

  const handleSave = () => {
    onSave(tempValue);
    onEdit(false);
  };

  return (
    <div className="flex items-center gap-2 mb-2">
      {isEditing ? (
        <>
          {fieldType === "textarea" ? (
            <textarea
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="bg-gray-700 text-white p-2 rounded flex-1"
              rows="3"
            />
          ) : (
            <input
              type={fieldType}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="bg-gray-700 text-white p-2 rounded flex-1"
            />
          )}
          <button
            onClick={handleSave}
            className="p-2 bg-green-600 rounded hover:bg-green-500"
          >
            <FaCheckCircle />
          </button>
        </>
      ) : (
        <>
          <span className="flex-1">{value || "N/A"}</span>
          <button
            onClick={() => onEdit(true)}
            className="text-gray-400 hover:text-white"
          >
            <FaInfoCircle />
          </button>
        </>
      )}
    </div>
  );
};

const CreateEventForm = () => {
  const navigate = useNavigate();

  // ----------------------------------
  // FORM & FIRESTORE STATE
  // ----------------------------------
  const [activeStep, setActiveStep] = useState("appearance");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hostName, setHostName] = useState("");
  const [eventType, setEventType] = useState("online");
  const [platform, setPlatform] = useState("");
  const [platformLink, setPlatformLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [language, setLanguage] = useState("English");
  const [location, setLocation] = useState({
    address: "",
    googleMapUrl: "",
    coordinates: { latitude: 0, longitude: 0 },
  });
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [tickets, setTickets] = useState([{}]);
  const [discussionRestricted, setDiscussionRestricted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [popup, setPopup] = useState(null);

  // ----------------------------------
  // THEME & CUSTOMIZATION STATE
  // ----------------------------------

  // BACKGROUND OPTIONS
  const backgroundOptions = [
    { label: "Light", value: "light" },
    { label: "Dim", value: "dim" },
    { label: "Lights Out", value: "dark" },
  ];
  const [backgroundValue, setBackgroundValue] = useState("dim");

  // ACCENT COLOR OPTIONS
  const colorOptions = [
    { label: "Blue", value: "#4cade6", textColor: "#FFFFFF" },
    { label: "Yellow", value: "#e6d14c", textColor: "#000000" },
    { label: "Red", value: "#cd5c5c", textColor: "#FFFFFF" },
    { label: "Green", value: "#4ce69e", textColor: "#FFFFFF" },
    { label: "Purple", value: "#6b4ce6", textColor: "#FFFFFF" },
  ];
  const [accentColor, setAccentColor] = useState(colorOptions[0]);

  // FONT SIZE
  const [fontSize, setFontSize] = useState(16);

  // MODAL STATE
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Show a custom popup alert for 3 seconds
  const showPopup = (message, type = "success") => {
    setPopup({ message, type });
    setTimeout(() => setPopup(null), 3000);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // ----------------------------------
  // IMAGE UPLOAD
  // ----------------------------------
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert("Image size exceeds 10MB. Please upload a smaller image.");
        return;
      }
      const url = await uploadImageToImgBB(file);
      setImageUrl(url);
    }
  };

  // ----------------------------------
  // TICKET HANDLERS
  // ----------------------------------
  const addTicket = () => {
    setTickets((prev) => [...prev, {}]);
  };
  const removeTicket = (index) => {
    setTickets((prev) => prev.filter((_, i) => i !== index));
  };
  const toggleDiscussionRestricted = () => {
    setDiscussionRestricted((prev) => !prev);
  };

  // ----------------------------------
  // FORM SUBMISSION
  // ----------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const eventDataToSave = {
        title,
        description,
        hostName,
        imageUrl: imageUrl || "",
        language,
        eventType,
        platform,
        platformLink,
        location,
        startTime,
        endTime,
        tickets: tickets.map((ticket) => ({
          ...ticket,
          quantity: ticket.quantity === "" ? null : parseInt(ticket.quantity),
          price: ticket.price === "" ? 0 : parseFloat(ticket.price),
          purchaseLimit:
            ticket.purchaseLimit === "" ? null : parseInt(ticket.purchaseLimit),
        })),
        attendees: [],
        creatorId: auth.currentUser.uid,
        paymentSettings: {
          provider: "paystack",
          creatorId: auth.currentUser.uid,
        },
        discussionForum: "forum_id",
        discussionRestricted,
        liveStreamUrl: "",
        createdAt: new Date().toISOString(),
        status: "active",
      };

      const docRef = await addDoc(collection(db, "events"), eventDataToSave);

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate(`/event-page/${docRef.id}`);
      }, 2000);
    } catch (error) {
      console.error("Error creating event:", error);
      showPopup("Failed to create event.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------
  // THEME MAPPING
  // ----------------------------------
  const getBackgroundStyle = (val) => {
    switch (val) {
      case "dim":
        return { backgroundColor: "#151123", color: "#FFFFFF" };
      case "light":
        return { backgroundColor: "#FFFFFF", color: "#000000" };
      case "dark":
        return { backgroundColor: "#0f0c19", color: "#FFFFFF" };
      default:
        return { backgroundColor: "#151123", color: "#FFFFFF" };
    }
  };

  const containerStyle = {
    ...getBackgroundStyle(backgroundValue),
    fontSize: `${fontSize}px`,
    "--accent-color": accentColor.value,
    "--accent-text-color": accentColor.textColor,
  };

  const formBackground =
    backgroundValue === "light"
      ? "#f9f9f9"
      : backgroundValue === "dim"
      ? "#2c2c2c"
      : "#111111";

  // ----------------------------------
  // THEME MODAL HANDLERS
  // ----------------------------------
  const openThemeModal = () => {
    setIsThemeModalOpen(true);
  };

  const closeThemeModal = (e) => {
    if (e.target.classList.contains("customize-theme")) {
      setIsThemeModalOpen(false);
    }
  };

  if (pageLoading) {
    return <CreateEventFormSkeleton />;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen relative" style={containerStyle}>
      {/* TOP BAR CONTAINER (Responsive Back and Theme Buttons) */}
      <div className="w-full flex items-center justify-between px-2 py-2 sm:px-4 sm:py-4">
        <button
          onClick={() => navigate(-1)}
          className="px-2 py-1 text-xs sm:text-sm md:text-base rounded-lg"
          style={{
            backgroundColor: "var(--accent-color)",
            color: "var(--accent-text-color)",
          }}
        >
          Back
        </button>

        <button
          onClick={openThemeModal}
          className="px-2 py-1 text-xs sm:text-sm md:text-base rounded-lg flex items-center gap-1 sm:gap-2"
          style={{
            backgroundColor: "var(--accent-color)",
            color: "var(--accent-text-color)",
          }}
        >
          <FaPalette className="text-sm sm:text-base md:text-xl" />
          <span className="hidden md:inline">Theme</span>
        </button>
      </div>

      {/* THEME MODAL */}
      {isThemeModalOpen && (
        <div
          className="customize-theme fixed inset-0 bg-black bg-opacity-50 grid place-items-center z-50"
          onClick={closeThemeModal}
        >
          <div className="bg-white text-black p-6 rounded-lg max-w-sm w-full" style={{ fontSize: "14px" }}>
            <h3 className="text-xl font-bold mb-1">Customize your view</h3>
            <p className="text-sm mb-4">Manage your font size, color, and background.</p>

            {/* FONT SIZE SLIDER with bullet trackers */}
            <label className="block mb-1 font-semibold">Font Size</label>
            <div className="relative w-full">
              <input
                type="range"
                min="14"
                max="24"
                step="2"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full theme-range"
                list="fontSizeTicks"
              />
              <datalist id="fontSizeTicks">
                <option value="14" label="14"></option>
                <option value="16"></option>
                <option value="18" label="18"></option>
                <option value="20"></option>
                <option value="22"></option>
                <option value="24" label="24"></option>
              </datalist>
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>Aa</span>
              <span>Aa</span>
            </div>

            {/* ACCENT COLOR OPTIONS */}
            <label className="block mt-4 mb-1 font-semibold">Color</label>
            <div className="flex gap-2">
              {colorOptions.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setAccentColor(option)}
                  className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center"
                  style={{ backgroundColor: option.value }}
                >
                  {accentColor.value === option.value && (
                    <FaCheck className="text-white text-sm" />
                  )}
                </button>
              ))}
            </div>

            {/* BACKGROUND OPTIONS */}
            <label className="block mt-4 mb-1 font-semibold">Background</label>
            <div className="flex gap-2">
              {backgroundOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setBackgroundValue(option.value)}
                  className={`px-3 py-1 rounded border ${
                    backgroundValue === option.value
                      ? "border-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsThemeModalOpen(false)}
              className="mt-4 bg-gray-200 px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* CUSTOM POPUP ALERT */}
      {popup && (
        <div
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 text-sm px-6 py-3 rounded shadow-lg flex items-center gap-2"
          style={{ backgroundColor: "#333", color: "#fff" }}
        >
          {popup.type === "success" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span>{popup.message}</span>
        </div>
      )}

      {/* SUCCESS POPUP */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-6 left-1/2 transform -translate-x-1/2 text-green-500 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
          style={{ backgroundColor: "#000" }}
        >
          <FaCheckCircle className="text-green-500" />
          Event Created Successfully!
        </motion.div>
      )}

      {/* STEP NAVIGATION HEADER */}
      <div className="w-full text-center mb-6 px-4">
        <h2
          className="font-bold mb-4 capitalize font-inter text-2xl sm:text-3xl md:text-4xl"
          style={{ color: "var(--accent-color)" }}
        >
          Create An Event In 3 Simple Steps
        </h2>
        <div className="flex flex-col items-center space-y-2 sm:space-y-0 sm:flex-row sm:space-x-4 justify-center">
          <button
            type="button"
            onClick={() => setActiveStep("appearance")}
            className="px-4 py-2 rounded hover:opacity-80"
            style={{
              backgroundColor:
                activeStep === "appearance"
                  ? "var(--accent-color)"
                  : "transparent",
              color:
                activeStep === "appearance"
                  ? "var(--accent-text-color)"
                  : "var(--accent-color)",
              border: `1px solid var(--accent-color)`,
            }}
          >
            Appearance
          </button>
          <button
            type="button"
            onClick={() => setActiveStep("schedule")}
            className="px-4 py-2 rounded hover:opacity-80"
            style={{
              backgroundColor:
                activeStep === "schedule"
                  ? "var(--accent-color)"
                  : "transparent",
              color:
                activeStep === "schedule"
                  ? "var(--accent-text-color)"
                  : "var(--accent-color)",
              border: `1px solid var(--accent-color)`,
            }}
          >
            Schedule
          </button>
          <button
            type="button"
            onClick={() => setActiveStep("tickets")}
            className="px-4 py-2 rounded hover:opacity-80"
            style={{
              backgroundColor:
                activeStep === "tickets"
                  ? "var(--accent-color)"
                  : "transparent",
              color:
                activeStep === "tickets"
                  ? "var(--accent-text-color)"
                  : "var(--accent-color)",
              border: `1px solid var(--accent-color)`,
            }}
          >
            Tickets
          </button>
        </div>
      </div>

      {/* MAIN FORM CONTAINER */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-8 rounded-lg max-w-4xl w-full mx-4 my-4 relative"
        style={{ backgroundColor: formBackground }}
      >
        <h2
          className="text-2xl mb-6 font-bold"
          style={{ color: "var(--accent-color)" }}
        >
          {activeStep === "appearance"
            ? "Appearance"
            : activeStep === "schedule"
            ? "Schedule"
            : "Tickets"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* APPEARANCE STEP */}
          {activeStep === "appearance" && (
            <div className="section space-y-4">
             {/* Upload Image Section */}
              <div
                className="w-full h-60 relative border-4 border-dotted border-gray-400 mb-4 cursor-pointer"
                onClick={() => document.getElementById("fileInput").click()}
              >
                {imageUrl ? (
                  <div className="relative w-full h-full">
                    {/* Make the image fill the container */}
                    <img
                      src={imageUrl}
                      alt="Selected Event"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById("fileInput").click()}
                      className="absolute top-2 right-2 px-2 py-1 rounded text-xs border"
                      style={{
                        backgroundColor: "var(--accent-color)",
                        color: "var(--accent-text-color)",
                      }}
                    >
                      Change Image
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="bg-purple-200 rounded-full p-5 transition-transform duration-200 hover:scale-110">
                      <FiUpload className="text-purple-500 text-3xl mb-1" />
                    </div>
                    <p>Click to upload your event image</p>
                    <p className="text-gray-400">Maximum File size: 10mb</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  id="fileInput"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>


              {/* Title */}
              <div>
                <label className="block mb-1">Event Title</label>
                <div className="relative">
                  <FaInfoCircle className="absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    name="title"
                    type="text"
                    placeholder="Event Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 pl-10 focus:outline-none"
                    style={{
                      borderBottom: `1px solid var(--accent-color)`,
                      backgroundColor: "transparent",
                      color: "inherit",
                    }}
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block mb-1">Event Description</label>
                <div className="relative">
                  <FaInfoCircle className="absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <textarea
                    name="description"
                    placeholder="Event Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 pl-10 focus:outline-none"
                    style={{
                      borderBottom: `1px solid var(--accent-color)`,
                      backgroundColor: "transparent",
                      color: "inherit",
                    }}
                    rows={4}
                    required
                  />
                </div>
              </div>

              {/* Host Name */}
              <div>
                <label className="block mb-1">Host Name</label>
                <input
                  type="text"
                  name="hostName"
                  placeholder="Host Name"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="w-full p-3 focus:outline-none"
                  style={{
                    borderBottom: `1px solid var(--accent-color)`,
                    backgroundColor: "transparent",
                    color: "inherit",
                  }}
                  required
                />
              </div>

              {/* Language */}
              <div>
                <label className="block mb-1">Language</label>
                <select
                  name="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-3 focus:outline-none"
                  style={{
                    borderBottom: `1px solid var(--accent-color)`,
                    backgroundColor: "transparent",
                    color: "inherit",
                  }}
                  required
                >
                  <option value="English">English</option>
                  <option value="French">French</option>
                  <option value="Spanish">Spanish</option>
                </select>
              </div>
            </div>
          )}

          {/* SCHEDULE STEP */}
          {activeStep === "schedule" && (
            <div className="section space-y-4">
              <div>
                <label className="block mb-1">Event Type</label>
                <select
                  name="eventType"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full p-3 focus:outline-none"
                  style={{
                    borderBottom: `1px solid var(--accent-color)`,
                    backgroundColor: "transparent",
                    color: "inherit",
                  }}
                  required
                >
                  <option value="online">Online</option>
                  <option value="physical">Physical</option>
                </select>
              </div>

              {eventType === "online" && (
                <>
                  <div>
                    <label className="block mb-1">Platform</label>
                    <div className="relative">
                      <FaInfoCircle className="absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        name="platform"
                        type="text"
                        placeholder="Zoom, YouTube, etc."
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="w-full p-3 pl-10 focus:outline-none"
                        style={{
                          borderBottom: `1px solid var(--accent-color)`,
                          backgroundColor: "transparent",
                          color: "inherit",
                        }}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1">Platform Link</label>
                    <div className="relative">
                      <FaInfoCircle className="absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        name="platformLink"
                        type="text"
                        placeholder="Platform Link"
                        value={platformLink}
                        onChange={(e) => setPlatformLink(e.target.value)}
                        className="w-full p-3 pl-10 focus:outline-none"
                        style={{
                          borderBottom: `1px solid var(--accent-color)`,
                          backgroundColor: "transparent",
                          color: "inherit",
                        }}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {eventType === "physical" && (
                <>
                  <div>
                    <label className="block mb-1">Location Address</label>
                    <div className="relative">
                      <FaUsers className="absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        name="address"
                        type="text"
                        placeholder="Location Address"
                        value={location.address}
                        onChange={(e) =>
                          setLocation({ ...location, address: e.target.value })
                        }
                        className="w-full p-3 pl-10 focus:outline-none"
                        style={{
                          borderBottom: `1px solid var(--accent-color)`,
                          backgroundColor: "transparent",
                          color: "inherit",
                        }}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1">Google Map URL</label>
                    <div className="relative">
                      <FaInfoCircle className="absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        name="googleMapUrl"
                        type="text"
                        placeholder="Paste Google Map URL here"
                        value={location.googleMapUrl}
                        onChange={(e) =>
                          setLocation({
                            ...location,
                            googleMapUrl: e.target.value,
                          })
                        }
                        className="w-full p-3 pl-10 focus:outline-none"
                        style={{
                          borderBottom: `1px solid var(--accent-color)`,
                          backgroundColor: "transparent",
                          color: "inherit",
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row md:space-x-4">
                    <div className="w-full md:w-1/2">
                      <label className="block mb-1">Latitude</label>
                      <input
                        name="latitude"
                        type="text"
                        placeholder="Latitude"
                        value={location.coordinates.latitude}
                        onChange={(e) =>
                          setLocation({
                            ...location,
                            coordinates: {
                              ...location.coordinates,
                              latitude: parseFloat(e.target.value),
                            },
                          })
                        }
                        className="w-full p-3 focus:outline-none"
                        style={{
                          borderBottom: `1px solid var(--accent-color)`,
                          backgroundColor: "transparent",
                          color: "inherit",
                        }}
                        required
                      />
                    </div>
                    <div className="w-full md:w-1/2">
                      <label className="block mb-1">Longitude</label>
                      <input
                        name="longitude"
                        type="text"
                        placeholder="Longitude"
                        value={location.coordinates.longitude}
                        onChange={(e) =>
                          setLocation({
                            ...location,
                            coordinates: {
                              ...location.coordinates,
                              longitude: parseFloat(e.target.value),
                            },
                          })
                        }
                        className="w-full p-3 focus:outline-none"
                        style={{
                          borderBottom: `1px solid var(--accent-color)`,
                          backgroundColor: "transparent",
                          color: "inherit",
                        }}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block mb-1">Start Time</label>
                <div className="relative">
                  <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    name="startTime"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-3 pl-10 focus:outline-none"
                    style={{
                      borderBottom: `1px solid var(--accent-color)`,
                      backgroundColor: "transparent",
                      color: "inherit",
                    }}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1">End Time</label>
                <div className="relative">
                  <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    name="endTime"
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-3 pl-10 focus:outline-none"
                    style={{
                      borderBottom: `1px solid var(--accent-color)`,
                      backgroundColor: "transparent",
                      color: "inherit",
                    }}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* TICKETS STEP */}
          {activeStep === "tickets" && (
            <div className="section flex flex-col space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: "var(--accent-color)" }}>
                Tickets
              </h3>
              {tickets.map((ticket, index) => (
                <div key={index} className="ticket flex flex-col space-y-2 border-b border-gray-500 p-4">
                  <div>
                    <label className="block mb-1">Ticket Name</label>
                    <input
                      name={`ticketName-${index}`}
                      type="text"
                      placeholder="Ticket Name"
                      value={ticket.ticketName || ""}
                      onChange={(e) =>
                        setTickets((prev) =>
                          prev.map((t, i) =>
                            i === index ? { ...t, ticketName: e.target.value } : t
                          )
                        )
                      }
                      className="w-full p-3 focus:outline-none"
                      style={{
                        borderBottom: `1px solid var(--accent-color)`,
                        backgroundColor: "transparent",
                        color: "inherit",
                      }}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center">
                      <input
                        name={`freeTicket-${index}`}
                        type="checkbox"
                        checked={ticket.isFree || false}
                        onChange={(e) =>
                          setTickets((prev) =>
                            prev.map((t, i) =>
                              i === index ? { ...t, isFree: e.target.checked } : t
                            )
                          )
                        }
                        className="mr-2"
                      />
                      Free Ticket
                    </label>
                    {!ticket.isFree && (
                      <div>
                        <label className="block mb-1">Price</label>
                        <input
                          name={`ticketPrice-${index}`}
                          type="number"
                          placeholder="Price"
                          value={ticket.price || ""}
                          onChange={(e) =>
                            setTickets((prev) =>
                              prev.map((t, i) =>
                                i === index ? { ...t, price: e.target.value } : t
                              )
                            )
                          }
                          className="w-full p-3 focus:outline-none"
                          style={{
                            borderBottom: `1px solid var(--accent-color)`,
                            backgroundColor: "transparent",
                            color: "inherit",
                          }}
                          required
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block mb-1">Quantity (leave blank for unlimited)</label>
                      <input
                        name={`ticketQuantity-${index}`}
                        type="number"
                        placeholder="Quantity (leave blank for unlimited)"
                        value={ticket.quantity || ""}
                        onChange={(e) =>
                          setTickets((prev) =>
                            prev.map((t, i) =>
                              i === index ? { ...t, quantity: e.target.value } : t
                            )
                          )
                        }
                        className="w-full p-3 focus:outline-none"
                        style={{
                          borderBottom: `1px solid var(--accent-color)`,
                          backgroundColor: "transparent",
                          color: "inherit",
                        }}
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Purchase Limit per Attendee</label>
                      <input
                        name={`ticketPurchaseLimit-${index}`}
                        type="number"
                        placeholder="Purchase Limit per Attendee"
                        value={ticket.purchaseLimit || ""}
                        onChange={(e) =>
                          setTickets((prev) =>
                            prev.map((t, i) =>
                              i === index ? { ...t, purchaseLimit: e.target.value } : t
                            )
                          )
                        }
                        className="w-full p-3 focus:outline-none"
                        style={{
                          borderBottom: `1px solid var(--accent-color)`,
                          backgroundColor: "transparent",
                          color: "inherit",
                        }}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTicket(index)}
                    className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all"
                  >
                    Remove Ticket
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addTicket}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all"
              >
                Add Ticket
              </button>
            </div>
          )}

          {/* NAVIGATION BUTTONS */}
          <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
            {activeStep !== "appearance" && (
              <button
                type="button"
                onClick={() =>
                  setActiveStep(activeStep === "tickets" ? "schedule" : "appearance")
                }
                className="py-2 px-4 rounded-lg focus:outline-none"
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "var(--accent-text-color)",
                }}
              >
                Back
              </button>
            )}
            {activeStep !== "tickets" && (
              <button
                type="button"
                onClick={() =>
                  setActiveStep(activeStep === "appearance" ? "schedule" : "tickets")
                }
                className="py-2 px-4 rounded-lg focus:outline-none"
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "var(--accent-text-color)",
                }}
              >
                Next
              </button>
            )}
            {activeStep === "tickets" && (
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center"
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "var(--accent-text-color)",
                }}
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Create Event"
                )}
              </button>
            )}
          </div>
        </form>
      </motion.div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        /* Slider styles with custom bullet markers */
        .theme-range::-webkit-slider-runnable-track {
          background: #ccc;
          height: 3px;
          border-radius: 2px;
        }
        .theme-range::-moz-range-track {
          background: #ccc;
          height: 3px;
          border-radius: 2px;
        }
        .theme-range::-webkit-slider-thumb {
          appearance: none;
          background: var(--accent-color);
          width: 14px;
          height: 14px;
          border-radius: 50%;
          margin-top: -6px;
          cursor: pointer;
          border: 2px solid white;
        }
        .theme-range::-moz-range-thumb {
          background: var(--accent-color);
          width: 14px;
          height: 14px;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid white;
        }
      `}</style>
    </div>
  );
};

export default CreateEventForm;
