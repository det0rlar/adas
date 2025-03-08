// pages/EventPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import RegisterModal from "../src/components/RegisterModal";
import TicketingSystem from "../src/components/GetTicket";
import {
  FaCalendarAlt,
  FaClock,
  FaComments,
  FaFilm,
  FaCamera,
  FaFacebook,
  FaWallet,
  FaTwitter,
  FaInstagram,
  FaTools,
  FaGlobe,
  FaEdit,
  FaSave,
  FaTrash,
  FaArrowLeft,
  FaBell,
} from "react-icons/fa";
import { db } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";
import uploadImageToImgBB from "../utils/imgbb";
import LiveStream from "../src/components/LiveStreamPage";
import QAChatRoom from "../src/components/QAChatRoom";

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
              className="p-2 rounded flex-1 text-white bg-transparent border border-gray-600"
              rows="3"
            />
          ) : (
            <input
              type={fieldType}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="p-2 rounded flex-1 text-white bg-transparent border border-gray-600"
            />
          )}
          <button
            onClick={handleSave}
            className="p-2 bg-green-600 rounded hover:bg-green-500"
          >
            <FaSave />
          </button>
        </>
      ) : (
        <>
          <span className="flex-1 text-white">{value || "N/A"}</span>
          <button
            onClick={() => onEdit(true)}
            className="text-gray-400 hover:text-white"
          >
            <FaEdit />
          </button>
        </>
      )}
    </div>
  );
};

const Toast = ({ message, type, onDismiss }) => (
  <div
    className={`fixed bottom-4 z-40 right-4 p-4 rounded-lg ${
      type === "success" ? "bg-green-600" : "bg-red-600"
    } text-white flex items-center gap-4`}
  >
    <span>{message}</span>
    <button onClick={onDismiss} className="hover:text-gray-200">
      ×
    </button>
  </div>
);

const TicketModal = ({ event, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
    <div className="relative bg-black p-6 rounded-lg shadow-2xl w-11/12 max-w-lg">
      <TicketingSystem event={event} />
      <button
        onClick={onClose}
        className="mt-4 px-4 py-2 bg-gray-600 text-white rounded"
      >
        Close
      </button>
    </div>
  </div>
);

const EventPage = () => {
  const [toasts, setToasts] = useState([]);
  const [showTicketing, setShowTicketing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const [socialLinks, setSocialLinks] = useState({
    facebook: { name: "", url: "" },
    twitter: { name: "", url: "" },
    instagram: { name: "", url: "" },
    website: { name: "", url: "" },
  });
  const [hostedBy, setHostedBy] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [editingSocial, setEditingSocial] = useState({
    facebook: false,
    twitter: false,
    instagram: false,
    website: false,
  });
  const [editingHosted, setEditingHosted] = useState([]);
  const [editingHashtags, setEditingHashtags] = useState(false);

  // New: Single declaration for Q&A Chat Room toggle.
  const [chatEnabled, setChatEnabled] = useState(false);

  const ticketPrice =
    event?.tickets && event.tickets.length > 0
      ? parseFloat(event.tickets[0].price) === 0
        ? "Free"
        : `₦${event.tickets[0].price}`
      : "N/A";

  const formatDate = (date) => {
    try {
      if (!date) return "N/A";
      const d = new Date(date);
      const day = d.getDate();
      const month = d.toLocaleString("default", { month: "long" });
      const year = d.getFullYear();
      return `${getOrdinal(day)} ${month}, ${year}`;
    } catch (e) {
      return "Invalid date";
    }
  };

  const formatTime = (date) => {
    try {
      if (!date) return "N/A";
      const d = new Date(date);
      return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (e) {
      return "Invalid time";
    }
  };

  const addToast = (message, type) => {
    const newToast = { id: Date.now(), message, type };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== newToast.id));
    }, 5000);
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventDoc = await getDoc(doc(db, "events", eventId));
        if (eventDoc.exists()) {
          const eventData = eventDoc.data();
          const convertFirebaseDate = (date) => {
            if (date?.toDate) return date.toDate();
            if (date instanceof Date) return date;
            return new Date(date);
          };
          const processedData = {
            ...eventData,
            startTime: convertFirebaseDate(eventData.startTime),
            endTime: convertFirebaseDate(eventData.endTime),
            socialLinks: eventData.socialLinks || {
              facebook: { name: "", url: "" },
              twitter: { name: "", url: "" },
              instagram: { name: "", url: "" },
              website: { name: "", url: "" },
            },
            hostedBy: eventData.hostedBy || [],
            hashtags: eventData.hashtags || [],
          };
          setEvent({ id: eventDoc.id, ...processedData });
          setSocialLinks(processedData.socialLinks);
          setHostedBy(processedData.hostedBy);
          setHashtags(processedData.hashtags);
        } else {
          addToast("Event not found", "error");
          navigate("/dashboard");
        }
      } catch (error) {
        addToast("Error loading event", "error");
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId, navigate]);

  useEffect(() => {
    setEditingHosted(Array(hostedBy.length).fill(false));
  }, [hostedBy]);

  const handleUpdate = async (field, value) => {
    try {
      await updateDoc(doc(db, "events", eventId), { [field]: value });
      setEvent((prev) => ({ ...prev, [field]: value }));
      addToast("Update successful", "success");
    } catch (error) {
      addToast("Failed to update", "error");
      console.error("Update error:", error);
    }
  };

  const handleSocialLinkUpdate = async (platform, valueObj) => {
    try {
      await updateDoc(doc(db, "events", eventId), {
        [`socialLinks.${platform}`]: valueObj,
      });
      setSocialLinks((prev) => ({ ...prev, [platform]: valueObj }));
      addToast("Social link updated", "success");
    } catch (error) {
      addToast("Failed to update social link", "error");
      console.error("Error updating social link:", error);
    }
  };

  const updateHostedByField = async (newHostedBy) => {
    try {
      await updateDoc(doc(db, "events", eventId), { hostedBy: newHostedBy });
      setHostedBy(newHostedBy);
      addToast("Hosted by updated", "success");
    } catch (error) {
      addToast("Failed to update hosted by", "error");
      console.error("Error updating hosted by:", error);
    }
  };

  const updateHostedByItem = (index, field, value) => {
    const newHostedBy = [...hostedBy];
    newHostedBy[index] = { ...newHostedBy[index], [field]: value };
    setHostedBy(newHostedBy);
  };

  const saveHostedByItem = (index) => {
    updateHostedByField(hostedBy);
    let newEditing = [...editingHosted];
    newEditing[index] = false;
    setEditingHosted(newEditing);
  };

  const addHostedByItem = () => {
    const newHostedBy = [...hostedBy, { name: "", url: "" }];
    setHostedBy(newHostedBy);
    updateHostedByField(newHostedBy);
  };

  const removeHostedByItem = (index) => {
    const newHostedBy = hostedBy.filter((_, i) => i !== index);
    setHostedBy(newHostedBy);
    updateHostedByField(newHostedBy);
  };

  const updateHashtags = async (newHashtags) => {
    try {
      await updateDoc(doc(db, "events", eventId), { hashtags: newHashtags });
      setHashtags(newHashtags);
      addToast("Hashtags updated", "success");
    } catch (error) {
      addToast("Failed to update hashtags", "error");
      console.error("Error updating hashtags:", error);
    }
  };

  const handleDeleteEvent = async () => {
    try {
      await deleteDoc(doc(db, "events", eventId));
      addToast("Event deleted successfully", "success");
      navigate("/dashboard");
    } catch (error) {
      addToast("Failed to delete event", "error");
      console.error("Error deleting event:", error);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    try {
      setUploadLoading(true);
      const imageUrl = await uploadImageToImgBB(file);
      await handleUpdate("imageUrl", imageUrl);
    } catch (error) {
      addToast("Image upload failed", "error");
      console.error("Upload failed:", error);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleToggleDiscussionAccess = async () => {
    const currentValue = event.discussionRestricted || false;
    try {
      await updateDoc(doc(db, "events", eventId), {
        discussionRestricted: !currentValue,
      });
      setEvent((prev) => ({
        ...prev,
        discussionRestricted: !currentValue,
      }));
      addToast("Discussion access updated", "success");
    } catch (error) {
      addToast("Failed to update discussion access", "error");
      console.error("Error toggling discussion access:", error);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleNotifyMe = async () => {
    try {
      await addDoc(collection(db, "eventNotifications"), {
        eventId,
        userId: user.uid,
        email: user.email,
        notifyAt: event.startTime,
        createdAt: serverTimestamp(),
      });
      addToast("You will be notified at the event time", "success");
    } catch (error) {
      addToast("Failed to subscribe for notifications", "error");
      console.error("Error subscribing for notifications:", error);
    }
  };

  // New: Toggle for Q&A Chat Room (only for event creator)
  const handleToggleChatRoom = () => {
    setChatEnabled((prev) => !prev);
    addToast(
      `Q&A Chat Room ${!chatEnabled ? "enabled" : "disabled"}`,
      "success"
    );
  };

  // When the chat room is enabled and the user wants to join, navigate to the chat page.
  const handleEnterChatRoom = () => {
    navigate(`/events/${eventId}/chat`);
  };

  const isCreator = user?.uid === event?.creatorId;
  const attendees = event?.attendees || [];
  const goingCount = attendees.length;

  if (loading)
    return (
      <p className="text-center text-gray-400">
        Loading event...
      </p>
    );
  if (!event)
    return (
      <p className="text-center text-red-500">
        Event not found.
      </p>
    );

  return (
    <div className="font-roboto bg-black min-h-screen w-full pt-8 px-4 sm:px-6 lg:px-6 pb-48 relative">
      {/* Fixed Top-Left Back Button */}
      <div className="mb-8 pb-4">
        <div className="absolute top-4 left-4 z-50">
          <button
            onClick={() => navigate(-1)}
            className="text-purple-400 hover:text-purple-300 mb-5 flex items-center gap-2"
          >
            <FaArrowLeft /> Back
          </button>
        </div>
        {/* Fixed Top-Right Delete Button (for Creator) */}
        {isCreator && (
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={handleDeleteEvent}
              className="text-red-400 hover:text-red-300 mb-5 flex items-center gap-2"
            >
              <FaTrash /> Delete Event
            </button>
          </div>
        )}
      </div>

      {/* Main Content Container */}
      <div className="container mt-6 mx-auto flex flex-col lg:flex-row gap-6 pb-40 pt-8">
        {/* Left Column */}
        <div className="w-full mt-6 lg:w-1/2 p-4">
          <img
            src={event.imageUrl || "https://via.placeholder.com/800x500"}
            alt={event.title}
            className="w-full h-96 object-cover rounded-lg shadow-md mb-6"
          />
          <div className="mb-4 border-b border-white pb-2">
            <h2 className="text-2xl font-roboto uppercase text-gray-500">
              Host: {event.hostName}
            </h2>
          </div>
          <div className="mt-4">
            <h3 className="text-xl text-white mb-2">Social Links</h3>
            <div className="space-y-2">
              {/* Facebook */}
              <div className="flex items-center gap-2">
                <FaFacebook className="text-blue-500" />
                {editingSocial.facebook ? (
                  <>
                    <div className="flex flex-col flex-1">
                      <input
                        type="text"
                        value={socialLinks.facebook.name}
                        onChange={(e) =>
                          setSocialLinks({
                            ...socialLinks,
                            facebook: {
                              ...socialLinks.facebook,
                              name: e.target.value,
                            },
                          })
                        }
                        className="bg-transparent border-b border-white text-white focus:outline-none mb-1"
                        placeholder="Display Name"
                      />
                      <input
                        type="text"
                        value={socialLinks.facebook.url}
                        onChange={(e) =>
                          setSocialLinks({
                            ...socialLinks,
                            facebook: {
                              ...socialLinks.facebook,
                              url: e.target.value,
                            },
                          })
                        }
                        className="bg-transparent border-b border-white text-white focus:outline-none"
                        placeholder="Facebook URL"
                      />
                    </div>
                    <button
                      onClick={() => {
                        handleSocialLinkUpdate("facebook", socialLinks.facebook);
                        setEditingSocial({ ...editingSocial, facebook: false });
                      }}
                    >
                      <FaSave className="text-white" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1">
                      {socialLinks.facebook.url ? (
                        <a
                          href={socialLinks.facebook.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          {socialLinks.facebook.name || "Not set"}
                        </a>
                      ) : (
                        "Not set"
                      )}
                    </span>
                    <button
                      onClick={() =>
                        setEditingSocial({ ...editingSocial, facebook: true })
                      }
                      className="text-gray-400 hover:text-white"
                    >
                      <FaEdit />
                    </button>
                  </>
                )}
              </div>
              {/* Twitter */}
              <div className="flex items-center gap-2">
                <FaTwitter className="text-blue-400" />
                {editingSocial.twitter ? (
                  <>
                    <div className="flex flex-col flex-1">
                      <input
                        type="text"
                        value={socialLinks.twitter?.name || ""}
                        onChange={(e) =>
                          setSocialLinks({
                            ...socialLinks,
                            twitter: {
                              ...socialLinks.twitter,
                              name: e.target.value,
                            },
                          })
                        }
                        className="bg-transparent border-b border-white text-white focus:outline-none mb-1"
                        placeholder="Display Name"
                      />
                      <input
                        type="text"
                        value={socialLinks.twitter?.url || ""}
                        onChange={(e) =>
                          setSocialLinks({
                            ...socialLinks,
                            twitter: {
                              ...socialLinks.twitter,
                              url: e.target.value,
                            },
                          })
                        }
                        className="bg-transparent border-b border-white text-white focus:outline-none"
                        placeholder="Twitter URL"
                      />
                    </div>
                    <button
                      onClick={() => {
                        handleSocialLinkUpdate(
                          "twitter",
                          socialLinks.twitter || { name: "", url: "" }
                        );
                        setEditingSocial({ ...editingSocial, twitter: false });
                      }}
                    >
                      <FaSave className="text-white" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1">
                      {socialLinks.twitter?.url ? (
                        <a
                          href={socialLinks.twitter.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          {socialLinks.twitter?.name || "Not set"}
                        </a>
                      ) : (
                        "Not set"
                      )}
                    </span>
                    <button
                      onClick={() =>
                        setEditingSocial({ ...editingSocial, twitter: true })
                      }
                      className="text-gray-400 hover:text-white"
                    >
                      <FaEdit />
                    </button>
                  </>
                )}
              </div>
              {/* Instagram */}
              <div className="flex items-center gap-2">
                <FaInstagram className="text-pink-500" />
                {editingSocial.instagram ? (
                  <>
                    <div className="flex flex-col flex-1">
                      <input
                        type="text"
                        value={socialLinks.instagram?.name || ""}
                        onChange={(e) =>
                          setSocialLinks({
                            ...socialLinks,
                            instagram: {
                              ...socialLinks.instagram,
                              name: e.target.value,
                            },
                          })
                        }
                        className="bg-transparent border-b border-white text-white focus:outline-none mb-1"
                        placeholder="Display Name"
                      />
                      <input
                        type="text"
                        value={socialLinks.instagram?.url || ""}
                        onChange={(e) =>
                          setSocialLinks({
                            ...socialLinks,
                            instagram: {
                              ...socialLinks.instagram,
                              url: e.target.value,
                            },
                          })
                        }
                        className="bg-transparent border-b border-white text-white focus:outline-none"
                        placeholder="Instagram URL"
                      />
                    </div>
                    <button
                      onClick={() => {
                        handleSocialLinkUpdate(
                          "instagram",
                          socialLinks.instagram || { name: "", url: "" }
                        );
                        setEditingSocial({ ...editingSocial, instagram: false });
                      }}
                    >
                      <FaSave className="text-white" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1">
                      {socialLinks.instagram?.url ? (
                        <a
                          href={socialLinks.instagram.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-500 hover:text-pink-400"
                        >
                          {socialLinks.instagram?.name || "Not set"}
                        </a>
                      ) : (
                        "Not set"
                      )}
                    </span>
                    <button
                      onClick={() =>
                        setEditingSocial({ ...editingSocial, instagram: true })
                      }
                      className="text-gray-400 hover:text-white"
                    >
                      <FaEdit />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* People Going Section */}
          <div className="mt-4">
            <p className="text-white text-lg">{goingCount} going</p>
            <div className="flex -space-x-2 mt-2">
              {attendees.slice(0, 3).map((att, index) => (
                <img
                  key={index}
                  src={att.profilePic || "https://via.placeholder.com/40"}
                  alt={att.username}
                  className="w-10 h-10 rounded-full border-2 border-white"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Event Details and Options */}
        <div className="w-full mt-11 lg:w-1/2 p-4">
          <div className="space-y-6 text-left">
            {/* Event Title & Description */}
            <div className="space-y-4 mt-9">
              <h2 className="text-3xl text-white capitalize">
                {isCreator ? (
                  <EditableField
                    label="Title"
                    value={event.title}
                    onSave={(value) => handleUpdate("title", value)}
                    isEditing={editingField === "title"}
                    onEdit={(state) => setEditingField(state ? "title" : null)}
                  />
                ) : (
                  <span className="text-white">{event.title}</span>
                )}
              </h2>
              <h3 className="text-lg mt-5 text-white">About Event</h3>
              {isCreator ? (
                <EditableField
                  label="Description"
                  value={event.description}
                  onSave={(value) => handleUpdate("description", value)}
                  isEditing={editingField === "description"}
                  onEdit={(state) =>
                    setEditingField(state ? "description" : null)
                  }
                  fieldType="textarea"
                />
              ) : (
                <p className="text-gray-400 text-sm leading-relaxed">
                  {event.description}
                </p>
              )}
            </div>

            {/* Event Details */}
            <div className="space-y-4 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-purple-400" />
                    <span className="text-gray-300">Date:</span>
                    <span>{formatDate(event.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaClock className="text-purple-400" />
                    <span className="text-gray-300">Time:</span>
                    <span>
                      {formatTime(event.startTime)} - {formatTime(event.endTime)}
                    </span>
                  </div>
                  <div className="mt-11">{/* Render map or online link here */}</div>
                </div>
              </div>
              {isModalOpen && (
                <RegisterModal eventId={eventId} onClose={() => setIsModalOpen(false)} />
              )}
            </div>

            {/* Ticketing / Live Stream Section */}
            <div className="space-y-6">
              {event.liveStreamUrl && (
                <div className="mt-6">
                  <LiveStream url={event.liveStreamUrl} />
                </div>
              )}
            </div>
          </div>

          {/* Event Options Section */}
          <div className="event-options mt-96">
            <h3 className="text-2xl border-t border-gray-600 mt-11 text-purple-400 mb-6">
              Event Options
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  to={`/events/${eventId}/discussion`}
                  className="block py-2 px-4 hover:text-white transition-colors flex items-center gap-2"
                >
                  <FaComments size={20} className="text-purple-400" />
                  Discussion Forum
                </Link>
              </li>
              {isCreator && (
                <>
                  {/* Chat Room Toggle */}
                  <li>
                    <button
                      onClick={handleToggleChatRoom}
                      className="block py-2 px-4 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <FaComments size={20} className="text-purple-400" />
                      {chatEnabled
                        ? "Disable Q&A Chat Room"
                        : "Enable Q&A Chat Room"}
                    </button>
                  </li>
                  {/* When enabled, show button to join chat room */}
                  {chatEnabled && (
                    <li>
                      <button
                        onClick={handleEnterChatRoom}
                        className="block py-2 px-4 hover:text-white transition-colors flex items-center gap-2"
                      >
                        <FaComments size={20} className="text-purple-400" />
                        Join Q&A Chat Room
                      </button>
                    </li>
                  )}
                  <li>
                    <Link
                      to={`/events/${eventId}/payment-details`}
                      className="block py-2 px-4 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <FaWallet size={20} className="text-white" />
                      Payment Details
                    </Link>
                  </li>
                  <li>
                    <a
                      href="https://dashboard.paystack.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block py-2 px-4 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <FaWallet size={20} className="text-white" />
                      Paystack Dashboard
                    </a>
                  </li>
                  <li>
                    <Link
                      to={`/events/${eventId}/live-stream`}
                      className="block py-2 px-4 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <FaCamera size={20} className="text-white" />
                      <span className="text-sm">Create Live Stream</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={`/dashboard`}
                      className="block py-2 px-4 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <FaTools size={20} className="text-white" />
                      Manage Event
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link
                  to={`/events/${eventId}/summarized-video`}
                  className="block py-2 px-4 hover:text-white transition-colors flex items-center gap-2"
                >
                  <FaFilm size={20} className="text-purple-400" />
                  Summarized Video
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      {event && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 p-4 z-40">
          {event.tickets[0]?.isFree ? (
            <button
              onClick={openModal}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg text-lg"
            >
              Register
            </button>
          ) : (
            <button
              onClick={() => setShowTicketing(true)}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg text-lg"
            >
              Get Ticket: {ticketPrice}
            </button>
          )}
        </div>
      )}

      {/* Mobile Footer: Social Media Icons and "Host Your Event" Button */}
      <div className="block md:hidden mt-8 text-center">
        <div className="flex justify-center items-center gap-4 mb-4">
          {socialLinks.facebook?.url && (
            <a
              href={socialLinks.facebook.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-4xl text-blue-500 hover:text-blue-400"
            >
              <FaFacebook />
            </a>
          )}
          {socialLinks.twitter?.url && (
            <a
              href={socialLinks.twitter.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-4xl text-blue-400 hover:text-blue-300"
            >
              <FaTwitter />
            </a>
          )}
          {socialLinks.instagram?.url && (
            <a
              href={socialLinks.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-4xl text-pink-500 hover:text-pink-400"
            >
              <FaInstagram />
            </a>
          )}
          {socialLinks.website?.url && (
            <a
              href={socialLinks.website.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-4xl text-green-400 hover:text-green-300"
            >
              <FaGlobe />
            </a>
          )}
        </div>
        {user && (
          <div className="mt-4">
            <Link
              to="/create-event-form"
              className="text-white font-bold py-3 px-6 rounded-lg transition-colors inline-block"
            >
              Host Your Event on ADAS
            </Link>
          </div>
        )}
      </div>

      {/* Ticket Modal */}
      {showTicketing && (
        <TicketModal event={event} onClose={() => setShowTicketing(false)} />
      )}

      {/* Register Modal */}
      {isModalOpen && (
        <RegisterModal eventId={eventId} onClose={() => setIsModalOpen(false)} />
      )}

      {/* Footer Section */}
      <footer className="mt-8 mb-20 text-center text-white">
        <p>© 2025 Your Company. All rights reserved.</p>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default EventPage;
