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

// Helper: Return ordinal for day (e.g. 1st, 2nd, 3rd, etc.)
const getOrdinal = (n) => {
  const s = ["th", "st", "nd", "rd"],
    v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// EditableField Component (for title/description)
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

// Toast Component
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

// Ticket Modal Component
const TicketModal = ({ event, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    <div
      className="absolute inset-0 bg-black opacity-50"
      onClick={onClose}
    ></div>
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

  // Updated socialLinks state: each platform is an object with a display name and a URL.
  const [socialLinks, setSocialLinks] = useState({
    facebook: { name: "", url: "" },
    twitter: { name: "", url: "" },
    instagram: { name: "", url: "" },
    website: { name: "", url: "" },
  });
  const [customAlert, setCustomAlert] = useState(null);
  const [notifyClicked, setNotifyClicked] = useState(false);

  // New state for "Hosted by" section (array of objects: { name, url })
  const [hostedBy, setHostedBy] = useState([]);
  // New state for hashtags (array of strings)
  const [hashtags, setHashtags] = useState([]);

  // States to control editing mode for social links (if true, show two inputs)
  const [editingSocial, setEditingSocial] = useState({
    facebook: false,
    twitter: false,
    instagram: false,
    website: false,
  });
  // For hostedBy, use an array of booleans (one per item)
  const [editingHosted, setEditingHosted] = useState([]);
  // For hashtags, a single boolean to control editing mode
  const [editingHashtags, setEditingHashtags] = useState(false);

  // Ticket price display
  const ticketPrice =
    event?.tickets && event.tickets.length > 0
      ? parseFloat(event.tickets[0].price) === 0
        ? "Free"
        : `₦${event.tickets[0].price}`
      : "N/A";
  // Format date and time helpers
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

  // Fetch event data from Firestore and initialize fields
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
            // Expecting socialLinks to be stored as an object with keys for each platform
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

  // Initialize editingHosted array whenever hostedBy changes
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

  // Social links update function now expects an object with name and url
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

  // Functions for updating the "hostedBy" field
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

  // Hashtags update function
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

  // New function to subscribe for notifications at the event time.
  const handleNotifyMe = async () => {
    try {
      // Here we add a document to a collection "eventNotifications"
      // so that a backend (Cloud Function) can later send a notification.
      await addDoc(collection(db, "eventNotifications"), {
        eventId,
        userId: user.uid,
        email: user.email,
        notifyAt: event.startTime, // use the event start time (or modify as needed)
        createdAt: serverTimestamp(),
      });
      addToast("You will be notified at the event time", "success");
    } catch (error) {
      addToast("Failed to subscribe for notifications", "error");
      console.error("Error subscribing for notifications:", error);
    }
  };

  const isCreator = user?.uid === event?.creatorId;

  // Render map section with notify icon inline
  const renderMapSection = () => {
    if (event.eventType === "physical") {
      return (
        <div className="text-left">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white mb-2">Location Map</h2>
            <button
              onClick={handleNotifyMe}
              className="text-blue-400 hover:text-blue-300"
            >
              <FaBell
                size={24}
                className={notifyClicked ? "text-green-500" : ""}
              />
            </button>
          </div>
          {event.googleMapUrl ? (
            <iframe
              title="location-map"
              width="100%"
              height="300"
              loading="lazy"
              allowFullScreen
              src={event.googleMapUrl}
            />
          ) : (
            <div>
              <p className="text-white">
                {event.location?.address || "Address not available"}
              </p>
              <img
                src="https://via.placeholder.com/400x300?text=Map+Unavailable"
                alt="Map Unavailable"
                className="w-full h-64 object-cover"
              />
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="p-4 mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white mb-2">Join Online</h2>
            <button
              onClick={handleNotifyMe}
              className="text-blue-400 hover:text-blue-300"
            >
              <FaBell
                size={24}
                className={notifyClicked ? "text-green-500" : ""}
              />
            </button>
          </div>
          <a
            href={event.platformLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-lg"
          >
            {event.platform} Meeting Link
          </a>
        </div>
      );
    }
  };

  // Ticket Modal Component
  const TicketModal = ({ event, onClose }) => (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
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

  // For demonstration, assume event.attendees is an array of objects with a profilePic and username.
  const attendees = event?.attendees || [];
  const goingCount = attendees.length;

  if (loading)
    return (
      <p className="text-center items-center align-middle justify-center text-gray-400">
        Loading event...
      </p>
    );
  if (!event)
    return (
      <p className="text-center items-center align-middle justify-center text-red-500">
        Event not found.
      </p>
    );

  return (
    <div className="font-roboto bg-black min-h-screen w-full pt-8 px-4 sm:px-6 lg:px-6 pb-48 relative">
      {/* Top-Left Fixed Back Button */}
      <div className="mb-8 pb-4">
        <div className="absolute top-4 mb-5 left-4 z-50">
          <button
            onClick={() => navigate(-1)}
            className="text-purple-400 hover:text-purple-300 mb-5 flex items-center gap-2"
          >
            <FaArrowLeft /> Back
          </button>
        </div>

        {/* Top-Right Fixed Delete Button (for Creator) */}
        {isCreator && (
          <div className="absolute top-4 mb-5 right-4 z-50">
            <button
              onClick={handleDeleteEvent}
              className="text-red-400 hover:text-red-300 mb-5 flex items-center gap-2"
            >
              <FaTrash /> Delete Event
            </button>
          </div>
        )}
      </div>

      {/* Main Content Container with scrollable columns */}
      <div className="container mt-6 mx-auto flex flex-col lg:flex-row gap-6 pb-40 pt-8">
        {/* Left Column: Event Image, Host Name, Social Links, People Going, Hosted By & Hashtags */}
        <div className="w-full mt-6 lg:w-1/2 p-4">
          <img
            src={event.imageUrl || "https://via.placeholder.com/800x500"}
            alt={event.title}
            className="w-full h-96 object-cover rounded-lg shadow-md mb-6"
          />
          {/* Host Name */}
          <div className="mb-4 border-b border-white pb-2">
            <h2 className="text-2xl font-roboto uppercase text-gray-500">
              Host: {event.hostName}
            </h2>
          </div>

          {/* Social Links Section */}
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
                        handleSocialLinkUpdate(
                          "facebook",
                          socialLinks.facebook
                        );
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
                        setEditingSocial({
                          ...editingSocial,
                          instagram: false,
                        });
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
          </div>

          {/* Hosted By Section */}
          <div className="mt-4 border-b border-gray-600 pb-2">
            <h3 className="text-xl text-white mb-2">Hosted by</h3>
            {isCreator ? (
              <div className="space-y-2">
                {hostedBy.map((host, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {editingHosted[index] ? (
                      <>
                        <div className="flex flex-col flex-1">
                          <input
                            type="text"
                            placeholder="Display Name"
                            value={host.name}
                            onChange={(e) =>
                              updateHostedByItem(index, "name", e.target.value)
                            }
                            className="bg-transparent border-b border-gray-600 text-white flex-1 focus:outline-none mb-1"
                          />
                          <input
                            type="text"
                            placeholder="Host Link URL"
                            value={host.url}
                            onChange={(e) =>
                              updateHostedByItem(index, "url", e.target.value)
                            }
                            className="bg-transparent border-b border-gray-600 text-white flex-1 focus:outline-none"
                          />
                        </div>
                        <button onClick={() => saveHostedByItem(index)}>
                          <FaSave className="text-white" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1">
                          {host.url ? (
                            <a
                              href={host.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300"
                            >
                              {host.name || "Not set"}
                            </a>
                          ) : (
                            <span className="text-white">
                              {host.name || "Not set"}
                            </span>
                          )}
                        </span>
                        <button
                          onClick={() => {
                            let newEditing = [...editingHosted];
                            newEditing[index] = true;
                            setEditingHosted(newEditing);
                          }}
                          className="text-gray-400 hover:text-white"
                        >
                          <FaEdit />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => removeHostedByItem(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={addHostedByItem}
                  className="mt-2 text-blue-400 hover:text-blue-300"
                >
                  Add Host
                </button>
              </div>
            ) : (
              <ul>
                {hostedBy.map((host, index) =>
                  host.name ? (
                    <li key={index} className="text-white">
                      {host.url ? (
                        <a
                          href={host.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          {host.name}
                        </a>
                      ) : (
                        <span>{host.name}</span>
                      )}
                    </li>
                  ) : null
                )}
              </ul>
            )}
          </div>

          {/* Hashtags Section */}
          <div className="mt-4">
            <h3 className="text-xl text-white mb-2">Hashtags</h3>
            {isCreator ? (
              editingHashtags ? (
                <div className="space-y-2">
                  {[0, 1].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Hashtag (without #)"
                        value={hashtags[i] || ""}
                        onChange={(e) => {
                          const newTags = [...hashtags];
                          newTags[i] = e.target.value;
                          setHashtags(newTags);
                        }}
                        className="bg-transparent border-b border-white text-black flex-1 focus:outline-none"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      updateHashtags(hashtags);
                      setEditingHashtags(false);
                    }}
                    className="text-white hover:text-gray-300"
                  >
                    <FaSave />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {hashtags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 border border-white text-xs text-white bg-gray-600 bg-opacity-20 backdrop-blur-sm"
                      style={{ borderRadius: "10%" }}
                    >
                      #{tag}
                    </span>
                  ))}
                  <button
                    onClick={() => setEditingHashtags(true)}
                    className="text-gray-400 hover:text-white"
                  >
                    <FaEdit />
                  </button>
                </div>
              )
            ) : (
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 border border-white text-xs text-white bg-white bg-opacity-20 backdrop-blur-sm"
                    style={{ borderRadius: "20%" }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Display People Going */}
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
            {/* Title & About Event */}
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
                  <span
                    className="text-gray-800 mb-5"
                    style={{ color: "white" }}
                  >
                    {event.title}
                  </span>
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
                      {formatTime(event.startTime)} -{" "}
                      {formatTime(event.endTime)}
                    </span>
                  </div>
                  <div className="mt-11">{renderMapSection()}</div>
                </div>
              </div>

              {isModalOpen && (
                <RegisterModal
                  eventId={eventId}
                  onClose={() => setIsModalOpen(false)}
                />
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

          {/* Event Options */}
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
              className=" text-white font-bold py-3 px-6 rounded-lg transition-colors inline-block"
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
        <RegisterModal
          eventId={eventId}
          onClose={() => setIsModalOpen(false)}
        />
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
