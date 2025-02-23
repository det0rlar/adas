import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../config/firebase";
import RegisterModal from "../components/RegisterModal"; // Import the modal
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
  doc,
} from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import {
  FaPaperPlane,
  FaChevronDown,
  FaChevronUp,
  FaBars,
  FaTimes,
  FaPollH,
  FaEllipsisH,
  FaCheck,
  FaTimesCircle,
} from "react-icons/fa";

// Import your local default background image
import defaultBackground from "../assets/defaultBackground.jpg"; // Adjust the path accordingly

// Reusable ToggleSwitch component styled with Tailwind CSS
const ToggleSwitch = ({ checked, onChange }) => (
  <label className="relative inline-block w-10 h-6">
    <input
      type="checkbox"
      className="opacity-0 w-0 h-0"
      checked={checked}
      onChange={onChange}
    />
    <span
      className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-300 ${
        checked ? "bg-purple-600" : "bg-gray-400"
      }`}
    ></span>
    <span
      className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
        checked ? "translate-x-4" : ""
      }`}
    ></span>
  </label>
);

// Modal component for poll creation with a polished design
const PollModal = ({
  onClose,
  onSubmit,
  pollQuestion,
  setPollQuestion,
  pollOptionsArr,
  setPollOptionsArr,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Semi-transparent background */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      {/* Modal content */}
      <div className="relative bg-gradient-to-br from-gray-700 to-gray-900 p-6 rounded-lg shadow-2xl z-10 w-11/12 max-w-md">
        <h2 className="text-white text-2xl mb-4 font-bold">Create Poll</h2>
        <input
          type="text"
          placeholder="Enter your poll question"
          value={pollQuestion}
          onChange={(e) => setPollQuestion(e.target.value)}
          className="w-full p-3 rounded mb-3 bg-gray-800 text-white placeholder-gray-400"
        />
        {pollOptionsArr.map((option, idx) => (
          <div key={idx} className="flex items-center mb-3">
            <input
              type="text"
              placeholder={`Option ${idx + 1}`}
              value={option}
              onChange={(e) => {
                const newArr = [...pollOptionsArr];
                newArr[idx] = e.target.value;
                setPollOptionsArr(newArr);
              }}
              className="flex-1 p-3 rounded bg-gray-800 text-white placeholder-gray-400 overflow-x-hidden"
            />
            {pollOptionsArr.length > 2 && (
              <button
                type="button"
                onClick={() => {
                  const newArr = pollOptionsArr.filter((_, i) => i !== idx);
                  setPollOptionsArr(newArr);
                }}
                className="ml-2 text-red-400"
              >
                <FaTimesCircle size={22} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => setPollOptionsArr([...pollOptionsArr, ""])}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3 rounded mb-3"
        >
          Add Option
        </button>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded"
          >
            Create Poll
          </button>
        </div>
      </div>
    </div>
  );
};

const DiscussionForum = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State declarations
  const [eventData, setEventData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [polls, setPolls] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Customization state
  const [backgroundImage, setBackgroundImage] = useState("");
  const [fontFamily, setFontFamily] = useState("sans-serif");
  const [textColor, setTextColor] = useState("#ffffff");
  const [bubbleColor, setBubbleColor] = useState("#374151");
  const [bubbleOpacity, setBubbleOpacity] = useState(0.8);
  const [messageGap, setMessageGap] = useState(4);
  const [textSize, setTextSize] = useState("16px");
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Panel expansion states
  const [isBackgroundExpanded, setIsBackgroundExpanded] = useState(true);
  const [isFontExpanded, setIsFontExpanded] = useState(true);
  const [isColorsExpanded, setIsColorsExpanded] = useState(true);

  // Other states
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptionsArr, setPollOptionsArr] = useState(["", ""]);
  const [customAlert, setCustomAlert] = useState(null);
  const [openMessageMenu, setOpenMessageMenu] = useState(null);
  const [openPollMenu, setOpenPollMenu] = useState(null);

  // New state: track whether the authenticated user is registered for the event.
  const [isRegistered, setIsRegistered] = useState(false);

  // For combined feed ordering, merge messages and polls with a common time field.
  // Also, filter out any message whose username is "System" or "adas"
  const combinedFeed = [
    ...messages.map((m) => ({
      ...m,
      type: "message",
      time:
        m.timestamp && typeof m.timestamp.toDate === "function"
          ? m.timestamp.toDate()
          : new Date(m.timestamp || 0),
    })),
    ...polls.map((p) => ({
      ...p,
      type: "poll",
      time:
        p.createdAt && typeof p.createdAt.toDate === "function"
          ? p.createdAt.toDate()
          : new Date(p.createdAt || 0),
    })),
  ].filter(
    (item) =>
      !(
        item.type === "message" &&
        (item.username === "System" || item.username.toLowerCase() === "adas")
      )
  );
  combinedFeed.sort((a, b) => a.time - b.time);

  // Animated background state
  const [animationStyle] = useState({
    background: "linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)",
    backgroundSize: "400% 400%",
    animation: "gradient 15s ease infinite",
  });
  // Manually set the default background image (local file imported above)
  // You can also use a fixed URL if you prefer.
  const defaultBackgroundImage = defaultBackground;

  // Listen to event data in real time using onSnapshot
  useEffect(() => {
    if (!eventId) return;
    const eventRef = doc(db, "events", eventId);
    const unsubscribe = onSnapshot(eventRef, (docSnap) => {
      if (docSnap.exists()) {
        setEventData({ id: docSnap.id, ...docSnap.data() });
      }
    });
    return () => unsubscribe();
  }, [eventId]);

  // Check if the authenticated user is registered for the event by checking the attendees subcollection
  useEffect(() => {
    const checkRegistration = async () => {
      if (user && eventId) {
        const attendeeDoc = await getDoc(
          doc(db, "events", eventId, "attendees", user.uid)
        );
        setIsRegistered(attendeeDoc.exists());
      }
    };
    checkRegistration();
  }, [user, eventId]);

  const isCreator = eventData && user && eventData.creatorId === user.uid;
  const isEligibleToChat = () => {
    if (!eventData) return false;
    if (!eventData.discussionRestricted) return !!user;
    // If discussion is restricted, allow chat if the user is registered or is the creator.
    return isRegistered || isCreator;
  };

  // Listen for messages updates
  useEffect(() => {
    const messagesRef = collection(db, "events", eventId, "discussion");
    const q = query(messagesRef, orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs.reverse());
      setLoading(false);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
    return () => unsubscribe();
  }, [eventId]);

  // Listen for polls updates
  useEffect(() => {
    const pollsRef = collection(db, "events", eventId, "polls");
    const qPolls = query(pollsRef, orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(qPolls, (snapshot) => {
      const pollsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPolls(pollsData);
    });
    return () => unsubscribe();
  }, [eventId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await addDoc(collection(db, "events", eventId, "discussion"), {
        message: newMessage.trim(),
        // If anonymous mode is active (from eventData), store an empty username
        username: eventData?.anonymousMode
          ? ""
          : user.displayName || user.email.split("@")[0],
        userId: user.uid,
        timestamp: serverTimestamp(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Voting logic: one vote per user per poll.
  const handleVote = async (pollId, optionIndex) => {
    try {
      const pollRef = doc(db, "events", eventId, "polls", pollId);
      const poll = polls.find((p) => p.id === pollId);
      if (!poll) return;
      const voters = poll.voters || {};
      const currentVote = voters[user.uid];
      const newOptions = [...poll.options];
      if (currentVote !== undefined) {
        if (currentVote === optionIndex) return;
        if (newOptions[currentVote].count > 0) {
          newOptions[currentVote].count -= 1;
        }
      }
      newOptions[optionIndex].count += 1;
      const newVoters = { ...voters, [user.uid]: optionIndex };
      await updateDoc(pollRef, { options: newOptions, voters: newVoters });
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  // End poll handler: marks a poll as ended.
  const handleEndPoll = async (pollId) => {
    try {
      const pollRef = doc(db, "events", eventId, "polls", pollId);
      await updateDoc(pollRef, { ended: true });
    } catch (error) {
      console.error("Error ending poll:", error);
    }
  };

  // Poll creation handler
  const handleCreatePoll = async () => {
    if (!pollQuestion.trim()) {
      setCustomAlert({ message: "Poll question is required.", type: "error" });
      return;
    }
    const validOptions = pollOptionsArr
      .map((opt) => opt.trim())
      .filter((opt) => opt);
    if (validOptions.length < 2) {
      setCustomAlert({
        message: "At least two poll options are required.",
        type: "error",
      });
      return;
    }
    const pollData = {
      question: pollQuestion.trim(),
      options: validOptions.map((option) => ({ option, count: 0 })),
      voters: {},
      createdAt: serverTimestamp(),
      creatorId: user.uid,
      ended: false,
    };
    try {
      await addDoc(collection(db, "events", eventId, "polls"), pollData);
      setCustomAlert({
        message: "Poll created successfully!",
        type: "success",
      });
      setPollQuestion("");
      setPollOptionsArr(["", ""]);
      setShowPollModal(false);
      setTimeout(() => setCustomAlert(null), 3000);
    } catch (error) {
      console.error("Error creating poll:", error);
      setCustomAlert({ message: "Error creating poll", type: "error" });
      setTimeout(() => setCustomAlert(null), 3000);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteDoc(doc(db, "events", eventId, "discussion", messageId));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleDeletePoll = async (pollId) => {
    try {
      await deleteDoc(doc(db, "events", eventId, "polls", pollId));
    } catch (error) {
      console.error("Error deleting poll:", error);
    }
  };

  // Customization Panel
  const CustomizationPanel = () => (
    <div className="fixed top-16 right-4 z-[100] p-4 bg-gray-900 rounded-lg shadow-xl w-64">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-lg">Customization</h2>
        <button
          onClick={() => setIsPanelOpen(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <FaTimes className="text-xl" />
        </button>
      </div>
      {/* Background Section */}
      <div className="mb-4">
        <button
          className="flex items-center justify-between w-full text-white"
          onClick={() => setIsBackgroundExpanded(!isBackgroundExpanded)}
        >
          <span>Background</span>
          {isBackgroundExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {isBackgroundExpanded && (
          <div className="mt-2 space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleBackgroundUpload}
              className="text-white text-sm w-full"
            />
            <div className="flex items-center gap-2">
              <label className="text-white text-sm">Opacity:</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={bubbleOpacity}
                onChange={(e) => setBubbleOpacity(parseFloat(e.target.value))}
                className="w-24"
              />
            </div>
          </div>
        )}
      </div>
      {/* Font Section */}
      <div className="mb-4">
        <button
          className="flex items-center justify-between w-full text-white"
          onClick={() => setIsFontExpanded(!isFontExpanded)}
        >
          <span>Font</span>
          {isFontExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {isFontExpanded && (
          <div className="mt-2 space-y-2">
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="p-1 rounded bg-gray-800 text-white w-full"
            >
              <option value="sans-serif">Sans Serif</option>
              <option value="serif">Serif</option>
              <option value="monospace">Monospace</option>
              <option value="cursive">Cursive</option>
            </select>
            <div className="flex items-center gap-2">
              <label className="text-white text-sm">Size:</label>
              <input
                type="range"
                min="12"
                max="24"
                step="1"
                value={parseInt(textSize)}
                onChange={(e) => setTextSize(e.target.value + "px")}
                className="w-24"
              />
            </div>
          </div>
        )}
      </div>
      {/* Colors Section */}
      <div className="mb-4">
        <button
          className="flex items-center justify-between w-full text-white"
          onClick={() => setIsColorsExpanded(!isColorsExpanded)}
        >
          <span>Colors</span>
          {isColorsExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {isColorsExpanded && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-white text-sm">Text:</label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-8 h-8"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-white text-sm">Bubbles:</label>
              <input
                type="color"
                value={bubbleColor}
                onChange={(e) => setBubbleColor(e.target.value)}
                className="w-8 h-8"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-white text-sm">Spacing:</label>
              <input
                type="range"
                min="2"
                max="8"
                step="1"
                value={messageGap}
                onChange={(e) => setMessageGap(parseInt(e.target.value))}
                className="w-24"
              />
            </div>
          </div>
        )}
      </div>
      {/* Anonymous Room Section */}
      {isCreator && (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-white text-sm">Anonymous Room</span>
            <ToggleSwitch
              checked={eventData?.anonymousMode || false}
              onChange={async (e) => {
                const newValue = e.target.checked;
                try {
                  await updateDoc(doc(db, "events", eventId), {
                    anonymousMode: newValue,
                  });
                } catch (err) {
                  console.error("Error updating anonymous mode:", err);
                }
              }}
            />
          </div>
          <p className="text-gray-400 text-xs">
            Toggle to hide sender usernames for new messages
          </p>
        </div>
      )}
      {/* Lock Chat Section */}
      {isCreator && (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-white text-sm">Lock Chat</span>
            <ToggleSwitch
              checked={eventData?.chatLocked || false}
              onChange={async (e) => {
                const newValue = e.target.checked;
                try {
                  await updateDoc(doc(db, "events", eventId), {
                    chatLocked: newValue,
                  });
                } catch (err) {
                  console.error("Error updating chat lock:", err);
                }
              }}
            />
          </div>
          <p className="text-gray-400 text-xs">
            Toggle to allow only you to send messages
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Animated Background */}
      <div
        className="fixed top-0 left-0 w-full h-full opacity-20"
        style={animationStyle}
      ></div>
      {/* Hamburger Menu Button */}
      <button
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className="fixed top-4 right-4 z-50 p-3 bg-gray-900 rounded-lg text-white hover:bg-gray-800 transition-colors shadow-xl"
      >
        {isPanelOpen ? (
          <FaTimes className="text-xl" />
        ) : (
          <FaBars className="text-xl" />
        )}
      </button>
      {/* Customization Panel */}
      {isPanelOpen && <CustomizationPanel />}
      {/* Custom Popup Alert */}
      {customAlert && (
        <div className="fixed bottom-10 right-10 bg-green-100 text-green-800 p-3 rounded flex items-center shadow-lg">
          <FaCheck className="mr-2" />
          <span className="text-sm">{customAlert.message}</span>
        </div>
      )}
      {/* Poll Modal */}
      {showPollModal && isCreator && (
        <PollModal
          onClose={() => setShowPollModal(false)}
          onSubmit={handleCreatePoll}
          pollQuestion={pollQuestion}
          setPollQuestion={setPollQuestion}
          pollOptionsArr={pollOptionsArr}
          setPollOptionsArr={setPollOptionsArr}
        />
      )}
      {/* Combined Feed */}
      <div
        className="relative h-screen w-full p-4 flex flex-col"
        style={{
          backgroundImage: `url(${backgroundImage || defaultBackgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          fontFamily: fontFamily,
        }}
      >
        <header className="text-center mb-4">
          <h1 className="text-3xl font-bold text-white drop-shadow-md">
            {eventData?.title || "Discussion Forum"}
          </h1>
        </header>
        <div className="flex-1 overflow-auto bg-none rounded-lg backdrop-blur-none">
          {combinedFeed.map((item) =>
            item.type === "poll" ? (
              <div
                key={item.id}
                className="p-4 mb-3 rounded-lg border border-gray-600 shadow-md relative transition-transform"
                style={{ backgroundColor: bubbleColor, opacity: bubbleOpacity }}
              >
                {/* Header: Poll Question and Creator */}
                <div className="flex justify-between items-center">
                  <div className="flex flex-col flex-grow">
                    <div
                      className="font-extrabold text-left text-xl"
                      style={{ color: textColor }}
                    >
                      {item.question}
                    </div>
                    <span className="text-sm text-gray-300">
                      (by {item.creatorUsername || "Creator"})
                    </span>
                  </div>
                  {isCreator && item.creatorId === user.uid && (
                    <div className="relative ml-2">
                      <button
                        onClick={() =>
                          setOpenPollMenu(
                            openPollMenu === item.id ? null : item.id
                          )
                        }
                      >
                        <FaEllipsisH className="text-white" />
                      </button>
                      {openPollMenu === item.id && (
                        <div className="absolute right-0 mt-2 flex flex-col space-y-1 z-20">
                          {!item.ended && (
                            <button
                              onClick={() => {
                                handleEndPoll(item.id);
                                setOpenPollMenu(null);
                              }}
                              className="bg-yellow-500 text-white p-2 rounded text-sm"
                            >
                              End Poll
                            </button>
                          )}
                          <button
                            onClick={() => {
                              handleDeletePoll(item.id);
                              setOpenPollMenu(null);
                            }}
                            className="bg-red-600 text-white p-2 rounded text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* Subheader */}
                <div className="mt-1">
                  <p className="text-[100%] text-gray-300">Select one</p>
                </div>
                {/* Poll Options */}
                <div className="mt-3">
                  {(() => {
                    const maxCount = Math.max(
                      ...item.options.map((opt) => opt.count),
                      0
                    );
                    return item.options.map((opt, idx) => {
                      const userVoted =
                        item.voters && item.voters[user.uid] === idx;
                      const percentage =
                        maxCount > 0 ? (opt.count / maxCount) * 100 : 0;
                      return (
                        <div
                          key={idx}
                          className="flex flex-col my-2 cursor-pointer"
                          onClick={() => {
                            if (!item.ended) handleVote(item.id, idx);
                          }}
                        >
                          {/* Poll Option Text */}
                          <div className="mb-1 text-white text-lg">
                            {opt.option}
                          </div>
                          {/* Option Row: Circle, Progress Bar and Count */}
                          <div className="flex items-center">
                            <div
                              className={`w-6 h-6 rounded-full border-2 mr-2 flex-shrink-0 ${
                                userVoted
                                  ? "bg-purple-600 border-purple-600"
                                  : "border-gray-400"
                              }`}
                            ></div>
                            <div className="flex-1 relative h-3 rounded-full bg-gray-300">
                              <div
                                className={`h-full rounded-full ${
                                  userVoted ? "bg-purple-600" : "bg-blue-500"
                                }`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-white">{opt.count}</span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                  {item.ended && (
                    <p className="text-center text-gray-300 mt-2">Poll Ended</p>
                  )}
                </div>
              </div>
            ) : (
              <div
                key={item.id}
                className="flex flex-col animate-fade-in mb-3 relative"
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-sm font-medium"
                    style={{ color: textColor, fontSize: textSize }}
                  >
                    {item.username}
                  </span>
                  <div className="flex items-center">
                    <span
                      className="text-xs"
                      style={{
                        color: textColor,
                        fontSize: `calc(${textSize} - 2px)`,
                      }}
                    >
                      {item.timestamp &&
                      typeof item.timestamp.toDate === "function"
                        ? item.timestamp.toDate().toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : item.timestamp || ""}
                    </span>
                    {item.type === "message" &&
                      (item.userId === user.uid || isCreator) && (
                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenMessageMenu(
                                openMessageMenu === item.id ? null : item.id
                              )
                            }
                          >
                            <FaEllipsisH className="ml-2 text-white" />
                          </button>
                          {openMessageMenu === item.id && (
                            <button
                              onClick={() => {
                                handleDeleteMessage(item.id);
                                setOpenMessageMenu(null);
                              }}
                              className="absolute right-0 mt-5 z-20 bg-red-600 text-white p-2 rounded text-sm"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                  </div>
                </div>
                <div
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: bubbleColor,
                    opacity: bubbleOpacity,
                    color: textColor,
                    fontSize: textSize,
                  }}
                >
                  <p className="text-base">{item.message}</p>
                </div>
              </div>
            )
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Chat input area */}
        <div className="p-4 border-t border-gray-700">
          {user ? (
            isEligibleToChat() ? (
              eventData?.chatLocked && !isCreator ? (
                <p className="text-center text-gray-400">
                  Chat is locked by the creator.
                </p>
              ) : (
                <div className="flex flex-col">
                  {isCreator && (
                    <div className="flex justify-end mb-2">
                      <button
                        onClick={() => setShowPollModal(true)}
                        className="text-white hover:text-gray-300"
                      >
                        <FaPollH className="text-3xl" />
                      </button>
                    </div>
                  )}
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Type your message..."
                      style={{ color: textColor, fontSize: textSize }}
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      <FaPaperPlane className="text-white text-xl" />
                    </button>
                  </form>
                </div>
              )
            ) : (
              <p className="text-center text-gray-400">
                Only event attendees can chat here
              </p>
            )
          ) : (
            <p className="text-center text-gray-400">
              Please log in to participate
            </p>
          )}
        </div>
      </div>
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default DiscussionForum;
