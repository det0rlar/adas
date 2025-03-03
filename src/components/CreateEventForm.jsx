// components/CreateEventForm.js
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaInfoCircle, FaUsers } from "react-icons/fa";
import { FiUpload, FiClock } from "react-icons/fi";
import uploadImageToImgBB from "../../utils/imgbb";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { db, auth } from "../../config/firebase";
import CreateEventFormSkeleton from "./Skeletons/CreateEventFormSkeleton";

// Import a local default background image

// Helper: Return ordinal for day (e.g. 1st, 2nd, 3rd, etc.)
const getOrdinal = (n) => {
  const s = ["th", "st", "nd", "rd"],
    v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// EditableField Component (kept as is)
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

  // Multi-step form state
  const [activeStep, setActiveStep] = useState("appearance");

  // --- Form Fields ---
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

  // Other states
  const [loading, setLoading] = useState(false); // form submission loading
  const [pageLoading, setPageLoading] = useState(true); // simulate page data loading
  const [showSuccess, setShowSuccess] = useState(false);
  const [popup, setPopup] = useState(null); // { message: string, type: "success" | "error" }

  // Utility to show custom popup alert for 3 seconds
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

  // Handle image upload with file size validation (max 10MB)
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

  // Add a new ticket row
  const addTicket = () => {
    setTickets((prev) => [...prev, {}]);
  };

  // Remove a ticket row
  const removeTicket = (index) => {
    setTickets((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle toggle for discussion access
  const toggleDiscussionRestricted = () => {
    setDiscussionRestricted((prev) => !prev);
  };

  // Form submission (system message creation removed)
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

      // Create event in Firestore
      const docRef = await addDoc(collection(db, "events"), eventDataToSave);

      // (Optionally initialize attendees subcollection if required)
      // await addDoc(collection(db, "events", docRef.id, "attendees"), { ... });

      // Show success popup and redirect to the event page
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

  if (pageLoading) {
    return <CreateEventFormSkeleton />;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full bg-black min-h-screen relative text-white">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 bg-black text-white px-4 py-2 rounded-lg"
      >
        Back
      </button>

      {/* Custom Popup Alert */}
      {popup && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black text-sm px-6 py-3 rounded shadow-lg flex items-center gap-2">
          {popup.type === "success" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
          <span
            className={
              popup.type === "success" ? "text-green-500" : "text-red-500"
            }
          >
            {popup.message}
          </span>
        </div>
      )}

      {/* Custom Success Popup */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-black text-green-500 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
        >
          <FaCheckCircle className="text-green-500" />
          Event Created Successfully!
        </motion.div>
      )}

      {/* Step Navigation Header */}
      <div className="flex flex-col items-center mb-6">
        <h2 className="text-3xl text-center font-bold mb-2 capitalize bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 font-inter">
          Create An Event In 3 Simple Steps
        </h2>
        <div className="flex space-x-8">
          <button
            type="button"
            onClick={() => setActiveStep("appearance")}
            className={`px-4 py-2 rounded ${
              activeStep === "appearance"
                ? "bg-purple-600"
                : "bg-black hover:bg-black"
            }`}
          >
            Appearance
          </button>
          <button
            type="button"
            onClick={() => setActiveStep("schedule")}
            className={`px-4 py-2 rounded ${
              activeStep === "schedule"
                ? "bg-purple-600"
                : "bg-black hover:bg-black"
            }`}
          >
            Schedule
          </button>
          <button
            type="button"
            onClick={() => setActiveStep("tickets")}
            className={`px-4 py-2 rounded ${
              activeStep === "tickets"
                ? "bg-purple-600"
                : "bg-black hover:bg-black"
            }`}
          >
            Tickets
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-8 bg-black rounded-lg max-w-4xl w-full mx-4 my-4 relative"
      >
        <h2 className="text-2xl mb-6 font-bold text-purple-400">
          {activeStep === "appearance"
            ? "Appearance"
            : activeStep === "schedule"
            ? "Schedule"
            : "Tickets"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Appearance Section */}
          {activeStep === "appearance" && (
            <div className="section space-y-4">
              {/* Upload Image Section at the Top */}
              <div
                className="w-full h-60 flex flex-col items-center justify-center border-4 border-dotted border-gray-400 mb-4 cursor-pointer"
                onClick={() => document.getElementById("fileInput").click()}
              >
                {imageUrl ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={imageUrl}
                      alt="Selected Event"
                      className="w-72 h-auto rounded-md border-b border-white"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("fileInput").click()
                      }
                      className="absolute top-2 right-2 bg-black text-white px-2 py-1 rounded text-xs border border-white"
                    >
                      Change Image
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="bg-purple-200 rounded-full p-5 transition-transform duration-200 hover:scale-110">
                      <FiUpload className="text-purple-500 text-3xl mb-1" />
                    </div>
                    <p className="text-white">
                      Click to upload your event image
                    </p>
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

              <div>
                <label className="block text-white mb-1">Event Title</label>
                <div className="relative">
                  <FaInfoCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white" />
                  <input
                    name="title"
                    type="text"
                    placeholder="Event Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 pl-10 bg-black text-white border-b border-white focus:outline-none"
                    style={{ borderBottomWidth: "1px" }}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-white mb-1">
                  Event Description
                </label>
                <div className="relative">
                  <FaInfoCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white" />
                  <textarea
                    name="description"
                    placeholder="Event Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 pl-10 bg-black text-white border-b border-white focus:outline-none h-32"
                    style={{ borderBottomWidth: "1px" }}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-white mb-1">Host Name</label>
                <input
                  type="text"
                  name="hostName"
                  placeholder="Host Name"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="w-full p-3 bg-black text-white border-b border-white focus:outline-none"
                  style={{ borderBottomWidth: "1px" }}
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-1">Language</label>
                <select
                  name="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-3 bg-black text-white border-b border-white focus:outline-none"
                  style={{ borderBottomWidth: "1px" }}
                  required
                >
                  <option value="English">English</option>
                  <option value="French">French</option>
                  <option value="Spanish">Spanish</option>
                </select>
              </div>
            </div>
          )}

          {/* Schedule Section */}
          {activeStep === "schedule" && (
            <div className="section space-y-4">
              <div>
                <label className="block text-white mb-1">Event Type</label>
                <select
                  name="eventType"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full p-3 bg-black text-white border-b border-white focus:outline-none"
                  style={{ borderBottomWidth: "1px" }}
                  required
                >
                  <option value="online">Online</option>
                  <option value="physical">Physical</option>
                </select>
              </div>

              {eventType === "online" && (
                <>
                  <div>
                    <label className="block text-white mb-1">
                      Platform (e.g., Zoom, YouTube)
                    </label>
                    <div className="relative">
                      <FaInfoCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white" />
                      <input
                        name="platform"
                        type="text"
                        placeholder="Platform (e.g., Zoom, YouTube)"
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="w-full p-3 pl-10 bg-black text-white border-b border-white focus:outline-none"
                        style={{ borderBottomWidth: "1px" }}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-white mb-1">
                      Platform Link
                    </label>
                    <div className="relative">
                      <FaInfoCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white" />
                      <input
                        name="platformLink"
                        type="text"
                        placeholder="Platform Link"
                        value={platformLink}
                        onChange={(e) => setPlatformLink(e.target.value)}
                        className="w-full p-3 pl-10 bg-black text-white border-b border-white focus:outline-none"
                        style={{ borderBottomWidth: "1px" }}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {eventType === "physical" && (
                <>
                  <div>
                    <label className="block text-white mb-1">
                      Location Address
                    </label>
                    <div className="relative">
                      <FaUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white" />
                      <input
                        name="address"
                        type="text"
                        placeholder="Location Address"
                        value={location.address}
                        onChange={(e) =>
                          setLocation({ ...location, address: e.target.value })
                        }
                        className="w-full p-3 pl-10 bg-black text-white border-b border-white focus:outline-none"
                        style={{ borderBottomWidth: "1px" }}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-white mb-1">
                      Google Map URL
                    </label>
                    <div className="relative">
                      <FaInfoCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white" />
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
                        className="w-full p-3 pl-10 bg-black text-white border-b border-white focus:outline-none"
                        style={{ borderBottomWidth: "1px" }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row md:space-x-4">
                    <div className="w-full md:w-1/2">
                      <label className="block text-white mb-1">Latitude</label>
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
                        className="w-full p-3 bg-black text-white border-b border-white focus:outline-none"
                        style={{ borderBottomWidth: "1px" }}
                        required
                      />
                    </div>
                    <div className="w-full md:w-1/2">
                      <label className="block text-white mb-1">Longitude</label>
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
                        className="w-full p-3 bg-black text-white border-b border-white focus:outline-none"
                        style={{ borderBottomWidth: "1px" }}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-white mb-1">Start Time</label>
                <div className="relative">
                  <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white" />
                  <input
                    name="startTime"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-3 pl-10 bg-black text-white border-b border-white focus:outline-none"
                    style={{ borderBottomWidth: "1px" }}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-white mb-1">End Time</label>
                <div className="relative">
                  <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white" />
                  <input
                    name="endTime"
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-3 pl-10 bg-black text-white border-b border-white focus:outline-none"
                    style={{ borderBottomWidth: "1px" }}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tickets Section */}
          {activeStep === "tickets" && (
            <div className="section flex flex-col space-y-4">
              <h3 className="text-lg text-purple-400 font-semibold">Tickets</h3>
              {tickets.map((ticket, index) => (
                <div
                  key={index}
                  className="ticket flex flex-col space-y-2 border-b border-white p-4"
                >
                  <div>
                    <label className="block text-white mb-1">Ticket Name</label>
                    <input
                      name={`ticketName-${index}`}
                      type="text"
                      placeholder="Ticket Name"
                      value={ticket.ticketName || ""}
                      onChange={(e) =>
                        setTickets((prev) =>
                          prev.map((t, i) =>
                            i === index
                              ? { ...t, ticketName: e.target.value }
                              : t
                          )
                        )
                      }
                      className="w-full p-3 bg-black text-white border-b border-white focus:outline-none"
                      style={{ borderBottomWidth: "1px" }}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center text-white">
                      <input
                        name={`freeTicket-${index}`}
                        type="checkbox"
                        checked={ticket.isFree || false}
                        onChange={(e) =>
                          setTickets((prev) =>
                            prev.map((t, i) =>
                              i === index
                                ? { ...t, isFree: e.target.checked }
                                : t
                            )
                          )
                        }
                        className="mr-2"
                      />
                      Free Ticket
                    </label>
                    {!ticket.isFree && (
                      <div>
                        <label className="block text-white mb-1">Price</label>
                        <input
                          name={`ticketPrice-${index}`}
                          type="number"
                          placeholder="Price"
                          value={ticket.price || ""}
                          onChange={(e) =>
                            setTickets((prev) =>
                              prev.map((t, i) =>
                                i === index
                                  ? { ...t, price: e.target.value }
                                  : t
                              )
                            )
                          }
                          className="w-full p-3 bg-black text-white border-b border-white focus:outline-none"
                          style={{ borderBottomWidth: "1px" }}
                          required
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-white mb-1">
                        Quantity (leave blank for unlimited)
                      </label>
                      <input
                        name={`ticketQuantity-${index}`}
                        type="number"
                        placeholder="Quantity (leave blank for unlimited)"
                        value={ticket.quantity || ""}
                        onChange={(e) =>
                          setTickets((prev) =>
                            prev.map((t, i) =>
                              i === index
                                ? { ...t, quantity: e.target.value }
                                : t
                            )
                          )
                        }
                        className="w-full p-3 bg-black text-white border-b border-white focus:outline-none"
                        style={{ borderBottomWidth: "1px" }}
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-1">
                        Purchase Limit per Attendee
                      </label>
                      <input
                        name={`ticketPurchaseLimit-${index}`}
                        type="number"
                        placeholder="Purchase Limit per Attendee"
                        value={ticket.purchaseLimit || ""}
                        onChange={(e) =>
                          setTickets((prev) =>
                            prev.map((t, i) =>
                              i === index
                                ? { ...t, purchaseLimit: e.target.value }
                                : t
                            )
                          )
                        }
                        className="w-full p-3 bg-black text-white border-b border-white focus:outline-none"
                        style={{ borderBottomWidth: "1px" }}
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

          {/* Navigation Buttons Between Steps */}
          <div className="flex justify-center space-x-4">
            {activeStep !== "appearance" && (
              <button
                type="button"
                onClick={() =>
                  setActiveStep(
                    activeStep === "tickets" ? "schedule" : "appearance"
                  )
                }
                className="py-2 px-4 bg-black text-white border-b border-white rounded-lg focus:outline-none"
                style={{ borderBottomWidth: "1px" }}
              >
                Back
              </button>
            )}
            {activeStep !== "tickets" && (
              <button
                type="button"
                onClick={() =>
                  setActiveStep(
                    activeStep === "appearance" ? "schedule" : "tickets"
                  )
                }
                className="py-2 px-4 bg-black text-white border-b border-white rounded-lg focus:outline-none"
                style={{ borderBottomWidth: "1px" }}
              >
                Next
              </button>
            )}
            {activeStep === "tickets" && (
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition-all flex items-center justify-center"
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
      `}</style>
    </div>
  );
};

export default CreateEventForm;
