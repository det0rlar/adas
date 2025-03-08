// QAChatRoom.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  doc,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useParams } from "react-router-dom";
import {
  FaLock,
  FaUnlock,
  FaPalette,
  FaCheck,
  FaTrash,
  FaTimes,
  FaImage,
  FaReply,
} from "react-icons/fa";
import uploadImageToImgBB from "../../utils/imgbb";

/* =============================
   Helper: Return basic background style for each mode
   ============================= */
const getBackgroundStyle = (mode) => {
  switch (mode) {
    case "dim":
      return { backgroundColor: "#151123", color: "#FFFFFF" };
    case "lightsOut":
      return { backgroundColor: "#0f0c19", color: "#FFFFFF" };
    case "light":
    default:
      return { backgroundColor: "#FFFFFF", color: "#000000" };
  }
};

/* =============================
   MessageBubble Component
   - Displays a single message bubble with parent text (if reply)
   - Message text is now bold and time is styled distinctly
   - Supports long press/right-click to open a custom context menu
   ============================= */
const MessageBubble = ({
  msg,
  isOutgoing,
  accentColor,
  onOpenContextMenu,
  handleNavigateToParent,
}) => {
  const bubbleRef = useRef(null);
  let touchStartX = 0;
  let longPressTimer = null;
  let swipeDetected = false;

  const handleTouchStart = (e) => {
    touchStartX = e.touches[0].clientX;
    swipeDetected = false;
    longPressTimer = setTimeout(() => {
      onOpenContextMenu(e.touches[0].clientX, e.touches[0].clientY, msg);
    }, 700);
  };

  const handleTouchMove = (e) => {
    const currentX = e.touches[0].clientX;
    const diffX = touchStartX - currentX;
    if (diffX > 50 && !swipeDetected) {
      swipeDetected = true;
      clearTimeout(longPressTimer);
      onOpenContextMenu(e.touches[0].clientX, e.touches[0].clientY, msg, "reply");
    }
  };

  const handleTouchEnd = () => {
    clearTimeout(longPressTimer);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    onOpenContextMenu(e.clientX, e.clientY, msg);
  };

  // Outgoing bubbles use accentColor; incoming use a dark gray.
  const bubbleBg = isOutgoing ? accentColor.value : "#202225";
  // For outgoing messages with yellow accent, use black text for time; otherwise, use a light shade.
  const timeTextColor =
    isOutgoing && accentColor.value === "#FFD60A" ? "#000000" : "#e5e7eb";

    return (
      <div
        id={`message-${msg.id}`}
        className={`
          mb-3 max-w-[60%] relative flex flex-col
          ${isOutgoing ? "ml-auto items-end" : "mr-auto items-start"}
        `}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onContextMenu={handleContextMenu}
        ref={bubbleRef}
      >
        <div
          className="relative px-6 pt-3 pb-8 rounded-2xl text-sm"
          style={{
            backgroundColor: bubbleBg,
            wordBreak: "break-word",
            color: isOutgoing && accentColor.value === "#FFD60A" ? "#000000" : "#FFFFFF",
          }}
        >
          {msg.replyTo && msg.parentText && (
            <div
              className="p-2 rounded-t-2xl bg-black bg-opacity-50 mb-2 cursor-pointer"
              onClick={() => handleNavigateToParent(msg.replyTo)}
            >
              <p className="text-green-300 text-bold text-xs mb-1">
                ~{msg.parentUser || "User"}
              </p>
              <p className="text-gray-200 italic">{msg.parentText}</p>
            </div>
          )}
          <p className="">{msg.message}</p>
          {/* Time element now positioned at bottom-left of bubble */}
          <div
            className="absolute  bottom-0 left-1 italic font-bold"
            style={{
              fontSize: "10px",
              fontFamily: "monospace",
              color: timeTextColor,
            }}
          >
            {msg.time}
          </div>
          {isOutgoing ? (
            <div
              className="absolute top-7 bottom-0 right-0 w-0 h-0"
              style={{
                borderTop: "10px solid transparent",
                borderBottom: "10px solid transparent",
                borderLeft: `10px solid ${bubbleBg}`,
                marginBottom: "-2px",
                marginRight: "-6px",
              }}
            ></div>
          ) : (
            <div
              className="absolute  top-5 bottom-0 left-0 w-0 h-0"
              style={{
                borderTop: "10px solid transparent",
                borderBottom: "10px solid transparent",
                borderRight: "10px solid #202225",
                marginBottom: "-2px",
                marginLeft: "-6px",
              }}
            ></div>
          )}
        </div>
      </div>
    );
};

/* =============================
   QAChatRoom Component
   ============================= */
const QAChatRoom = () => {
  const { eventId } = useParams();
  const { user } = useAuth();

  const [eventData, setEventData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);
  const [chatLocked, setChatLocked] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const messagesEndRef = useRef(null);

  // THEME states
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const colorOptions = [
    { label: "Yellow", value: "#FFD60A" },
    { label: "Red", value: "#FF3B30" },
    { label: "Green", value: "#34C759" },
    { label: "Blue", value: "#007AFF" },
  ];
  const [accentColor, setAccentColor] = useState(colorOptions[3]);
  const [backgroundMode, setBackgroundMode] = useState("dim");
  const [wallpaper, setWallpaper] = useState("");
  const [wallpaperOpacity, setWallpaperOpacity] = useState(1);

  // Track mobile state only once
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const baseStyle = getBackgroundStyle(backgroundMode);
  const containerStyle = {
    ...baseStyle,
    fontSize: `${fontSize}px`,
    "--accent-color": accentColor.value,
  };

  const isCreator = eventData && user && eventData.creatorId === user.uid;

  /* ========== Firebase Subscriptions ========== */
  useEffect(() => {
    if (!eventId) return;
    const unsub = onSnapshot(doc(db, "events", eventId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setEventData({ id: snap.id, ...data });
        setChatLocked(data.chatLocked || false);
      }
    });
    return () => unsub();
  }, [eventId]);

  useEffect(() => {
    async function checkRegistration() {
      if (user && eventId) {
        const attendeeDoc = await getDoc(doc(db, "events", eventId, "attendees", user.uid));
        setIsRegistered(attendeeDoc.exists());
      }
    }
    checkRegistration();
  }, [user, eventId]);

  useEffect(() => {
    if (!eventId) return;
    const collRef = collection(db, "events", eventId, "discussion");
    const q = query(collRef, orderBy("timestamp", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((docSnap) => {
        const d = docSnap.data();
        let jsDate = null;
        if (d.timestamp?.toDate) {
          jsDate = d.timestamp.toDate();
        }
        return {
          id: docSnap.id,
          message: d.message,
          username: d.username || "User",
          userId: d.userId,
          replyTo: d.replyTo || null,
          timestamp: jsDate,
        };
      });
      setMessages(msgs);
      setLoading(false);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
    return () => unsub();
  }, [eventId]);

  /* ========== Lock/Unlock Chat ========== */
  const handleToggleLock = async () => {
    if (!isCreator) return;
    const newVal = !chatLocked;
    setChatLocked(newVal);
    try {
      await updateDoc(doc(db, "events", eventId), { chatLocked: newVal });
    } catch (err) {
      console.error("Error toggling chat lock:", err);
    }
  };

  /* ========== Send Message ========== */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await addDoc(collection(db, "events", eventId, "discussion"), {
        message: newMessage.trim(),
        username: eventData?.anonymousMode
          ? ""
          : user.displayName || user.email.split("@")[0],
        userId: user.uid,
        replyTo: replyTarget,
        timestamp: serverTimestamp(),
      });
      setNewMessage("");
      setReplyTarget(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const isEligibleToChat = () => {
    if (!eventData) return false;
    if (!eventData.discussionRestricted) return !!user;
    return isRegistered || isCreator;
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      await deleteDoc(doc(db, "events", eventId, "discussion", msgId));
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  const handleNavigateToParent = (parentId) => {
    const el = document.getElementById(`message-${parentId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      el.classList.add("highlight-parent");
      setTimeout(() => {
        el.classList.remove("highlight-parent");
      }, 800);
    }
  };

  const handleWallpaperUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const url = await uploadImageToImgBB(file);
        setWallpaper(url);
      } catch (error) {
        console.error("Error uploading wallpaper:", error);
      }
    }
  };

  /* ========== Context Menu ========== */
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    msg: null,
  });

  const showContextMenu = (x, y, msg, forcedReply = null) => {
    if (forcedReply === "reply") {
      setReplyTarget(msg.id);
      return;
    }
    setContextMenu({ visible: true, x, y, msg });
  };

  const hideContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, msg: null });
  };

  const handleContextReply = () => {
    if (contextMenu.msg) setReplyTarget(contextMenu.msg.id);
    hideContextMenu();
  };

  const handleContextDelete = () => {
    if (contextMenu.msg) handleDeleteMessage(contextMenu.msg.id);
    hideContextMenu();
  };

  const getContextMenuStyle = () => {
    const menuWidth = 200;
    const leftPos = Math.min(contextMenu.x, window.innerWidth - menuWidth - 20);
    return { top: contextMenu.y, left: leftPos };
  };

  const renderMessages = () => {
    const messagesMap = new Map();
    messages.forEach((m) => messagesMap.set(m.id, m));

    return messages.map((msg) => {
      const timeStr = msg.timestamp
        ? msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "";
      const isOutgoing = msg.userId === user?.uid;
      let parentText = "";
      let parentUser = "";
      if (msg.replyTo && messagesMap.has(msg.replyTo)) {
        const parent = messagesMap.get(msg.replyTo);
        parentText = parent.message;
        parentUser = parent.username || "User";
      }
      return (
        <MessageBubble
          key={msg.id}
          msg={{ ...msg, time: timeStr, parentText, parentUser }}
          isOutgoing={isOutgoing}
          accentColor={accentColor}
          handleNavigateToParent={handleNavigateToParent}
          onOpenContextMenu={(xx, yy, msgObj, forcedReply) => {
            showContextMenu(xx, yy, msgObj, forcedReply);
          }}
        />
      );
    });
  };

  const [isMobileState, setIsMobileState] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobileState(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

 // Always use "cover" so wallpaper fills entire screen
 const wallpaperLayerStyle = {
  backgroundImage: wallpaper ? `url(${wallpaper})` : "none",
  backgroundSize: "cover",         // Always fill entire screen
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  opacity: wallpaperOpacity,
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: -1,
};

  return (
    <div className="fixed inset-0 hide-scrollbar" style={containerStyle}>
      {/* Wallpaper Layer */}
      {wallpaper && <div style={wallpaperLayerStyle} />}
      {/* Main Content */}
      <div className="flex flex-col h-full">
        {/* Top Bar */}
        <div
          className="p-3 flex items-center justify-between"
          style={{ backgroundColor: "#000000", borderBottom: "1px solid #333", color: "var(--accent-color)" }}
        >
          <h3 className="text-lg font-bold">Q&A Chat Room</h3>
          <div className="flex items-center gap-3">
            {isCreator && (
              <button onClick={handleToggleLock} title={chatLocked ? "Unlock Chat" : "Lock Chat"}>
                {chatLocked ? <FaUnlock /> : <FaLock />}
              </button>
            )}
            <button onClick={() => setIsThemeModalOpen(!isThemeModalOpen)} title="Customize Theme">
              {isThemeModalOpen ? <FaTimes /> : <FaPalette />}
            </button>
          </div>
        </div>
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-3 hide-scrollbar">
          {loading ? (
            <p className="text-gray-400">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-gray-400">No messages yet.</p>
          ) : (
            renderMessages()
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Input Area */}
        <div className="p-3" style={{ backgroundColor: "#000000", borderTop: "1px solid #333" }}>
          {!user ? (
            <p className="text-center text-gray-400">Please log in to participate</p>
          ) : !(
              eventData &&
              (!eventData.discussionRestricted || isRegistered || isCreator)
            ) ? (
            <p className="text-center text-gray-400">Only event attendees can chat here</p>
          ) : chatLocked && !isCreator ? (
            <p className="text-center text-gray-400">Chat is locked by the creator.</p>
          ) : (
            <form onSubmit={handleSendMessage} className="flex flex-col">
              {replyTarget && (
                <div className="mb-2 p-2 bg-white/20 rounded">
                  <span className="text-sm text-gray-100">Replying to a message</span>
                  <button onClick={() => setReplyTarget(null)} className="ml-2 text-red-400">
                    Cancel
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 p-2 rounded border border-gray-600 bg-transparent text-white focus:outline-none"
                  placeholder="Type your message..."
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: "var(--accent-color)",
                    color: accentColor.value === "#FFD60A" ? "#000000" : "#ffffff",
                  }}
                  className="px-4 py-2 rounded font-semibold"
                >
                  Send
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      {/* THEME MODAL */}
      {isThemeModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsThemeModalOpen(false)}
          ></div>
          <div className="relative bg-white text-black p-6 rounded-lg max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-1">Customize your view</h3>
            <p className="text-sm mb-4 text-gray-700">
              Manage your font size, accent color, background, and wallpaper opacity.
            </p>
            {/* Font Size */}
            <label className="block mb-2 font-semibold">Font Size</label>
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
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>Aa</span>
              <span>Aa</span>
            </div>
            {/* Accent Color */}
            <label className="block mt-4 mb-2 font-semibold">Accent Color</label>
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
            {/* Background Mode */}
            <label className="block mt-4 mb-2 font-semibold">Background</label>
            <div className="flex gap-2">
              {["light", "dim", "lightsOut"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setBackgroundMode(mode)}
                  className={`px-3 py-1 rounded border ${
                    backgroundMode === mode ? "border-blue-500" : "border-gray-300"
                  } text-sm`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
            {/* Wallpaper Upload */}
            <label className="block mt-4 mb-2 font-semibold">Wallpaper</label>
            <div className="flex items-center gap-2">
              <label
                htmlFor="wallpaperUpload"
                className="px-3 py-1 rounded border border-gray-300 cursor-pointer flex items-center gap-1 text-sm"
              >
                <FaImage />
                Upload
              </label>
              <input
                type="file"
                id="wallpaperUpload"
                accept="image/*"
                className="hidden"
                onChange={handleWallpaperUpload}
              />
              {wallpaper && (
                <button
                  onClick={() => setWallpaper("")}
                  className="text-red-500 hover:text-red-400 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
            {/* Wallpaper Opacity */}
            {wallpaper && (
              <>
                <label className="block mt-4 mb-2 font-semibold">Wallpaper Opacity</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={wallpaperOpacity}
                  onChange={(e) => setWallpaperOpacity(Number(e.target.value))}
                  className="w-full theme-range"
                />
              </>
            )}
            {/* Close Button */}
            <button
              onClick={() => setIsThemeModalOpen(false)}
              className="mt-6 bg-gray-200 px-4 py-2 rounded font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Custom Context Menu */}
      {contextMenu.visible && (
        <div
          className="fixed z-50 bg-gray-700 text-white p-2 rounded shadow-lg"
          style={getContextMenuStyle()}
          onMouseLeave={hideContextMenu}
        >
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-600"
            onClick={handleContextReply}
          >
            Reply
          </button>
          {(isCreator || contextMenu.msg?.userId === user?.uid) && (
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-600"
              onClick={handleContextDelete}
            >
              Delete
            </button>
          )}
        </div>
      )}

      {/* Additional CSS */}
      <style>{`
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
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
  .highlight-parent {
    animation: highlight-parent 0.8s ease;
  }
  @keyframes highlight-parent {
    0% { box-shadow: inset 0 0 0px 0px var(--accent-color); }
    50% { box-shadow: inset 0 0 0px 2px var(--accent-color); }
    100% { box-shadow: inset 0 0 0px 0px var(--accent-color); }
  }
`}</style>
    </div>
  );
};

export default QAChatRoom;
