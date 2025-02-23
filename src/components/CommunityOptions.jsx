import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaMosque,
  FaPrayingHands,
  FaMoon,
  FaCheckCircle,
  FaTimesCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import { db } from "../../config/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import Spinner from "./Spinner";
import CommunityOptionsSkeleton from "./Skeletons/CommunityOptionsSkeleton"; // Import the skeleton component

const CommunityOptions = () => {
  const icons = [FaMosque, FaPrayingHands, FaMoon];
  const [communityCode, setCommunityCode] = useState("");
  const [message, setMessage] = useState(null);
  const [loadingButton, setLoadingButton] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // State for loading
  const navigate = useNavigate();
  const auth = getAuth();

  // Authentication state listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("User state changed:", !!user);
      if (!user) {
        navigate("/login");
      } else {
        setIsLoading(false); // Stop loading when user is authenticated
      }
    });
    return unsubscribe;
  }, [auth, navigate]);

  // Simulate initial loading delay (optional)
  useEffect(() => {
    console.log("Simulating loading delay...");
    const timer = setTimeout(() => {
      console.log("Simulated loading delay completed.");
      setIsLoading(false);
    }, 2000); // Adjust delay as needed
    return () => clearTimeout(timer);
  }, []);

  // Message timeout handler
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [message]);

  // Handler for creating a community
  const handleCreateCommunity = () => {
    setLoadingButton("create");
    setTimeout(() => {
      setLoadingButton(null);
      navigate("/create-community");
    }, 2000);
  };

  // Handler for exploring communities
  const handleExploreCommunity = () => {
    setLoadingButton("explore");
    setTimeout(() => {
      setLoadingButton(null);
      navigate("/general-community-page");
    }, 2000);
  };

  // Handler for joining a community
  const handleJoinCommunity = async () => {
    if (!communityCode.trim()) {
      setMessage({ type: "error", text: "Please enter a community code" });
      return;
    }

    setLoadingButton("join");
    const formattedCode = communityCode.trim().toUpperCase();

    try {
      const q = query(
        collection(db, "communities"),
        where("communityCode", "==", formattedCode)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const communityDoc = querySnapshot.docs[0];

        // Add current user's UID to the members array using arrayUnion
        await updateDoc(communityDoc.ref, {
          members: arrayUnion(auth.currentUser.uid),
        });

        setMessage({
          type: "success",
          text: "Joined successfully! Redirecting...",
        });
        setTimeout(() => {
          navigate(`/community/${communityDoc.id}`);
          setLoadingButton(null);
        }, 2000);
      } else {
        setMessage({ type: "error", text: "Community not found!" });
        setLoadingButton(null);
      }
    } catch (error) {
      console.error("Community join error:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to join community",
      });
      setLoadingButton(null);
    }
  };

  // Handler for signing out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Render skeleton while loading
  if (isLoading) {
    console.log("Rendering skeleton...");
    return <CommunityOptionsSkeleton />;
  }

  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center overflow-hidden">
      {/* Animated background icons */}
      <div className="absolute w-80 h-80 flex items-center justify-center">
        {Array.from({ length: 9 }).map((_, i) => {
          const Icon = icons[i % icons.length];
          const angle = (i / 9) * 360;
          const radius = 120;

          return (
            <motion.div
              key={i}
              className="absolute text-white opacity-50"
              initial={{ rotate: angle, x: radius, scale: 0.8 }}
              animate={{ rotate: angle + 360 }}
              transition={{
                duration: 8 + i * 0.5,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                fontSize: `${Math.random() * 25 + 20}px`,
              }}
            >
              <Icon />
            </motion.div>
          );
        })}
      </div>

      {/* Main content card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 text-center text-white p-8 rounded-xl bg-black bg-opacity-80 shadow-2xl max-w-md w-full"
      >
        <h1 className="text-4xl font-semibold mb-6">Community Hub</h1>

        {/* Community code input */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Enter Community Code"
            className="w-full p-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={communityCode}
            onChange={(e) => setCommunityCode(e.target.value.toUpperCase())}
          />
          <button
            className={`w-full mt-4 py-3 rounded-lg bg-purple-700 hover:bg-purple-500 transition-all shadow-md text-lg font-semibold flex items-center justify-center gap-2 ${
              loadingButton === "join" ? "cursor-not-allowed opacity-75" : ""
            }`}
            onClick={handleJoinCommunity}
            disabled={loadingButton === "join"}
          >
            {loadingButton === "join" && <Spinner />}
            <span>{communityCode ? "Join Community" : "Enter Code"}</span>
          </button>
        </div>

        {/* Action buttons */}
        <div className="space-y-4">
          <button
            className={`w-full py-3 rounded-lg bg-green-700 hover:bg-green-500 transition-all shadow-md text-lg font-semibold flex items-center justify-center gap-2 ${
              loadingButton === "explore" ? "cursor-not-allowed opacity-75" : ""
            }`}
            onClick={handleExploreCommunity}
            disabled={loadingButton === "explore"}
          >
            {loadingButton === "explore" && <Spinner />}
            <span>Explore Communities</span>
          </button>
          <button
            className={`w-full py-3 text-blue-400 hover:text-blue-600 transition-all text-lg font-semibold flex items-center justify-center gap-2 ${
              loadingButton === "create" ? "cursor-not-allowed opacity-75" : ""
            }`}
            onClick={handleCreateCommunity}
            disabled={loadingButton === "create"}
          >
            {loadingButton === "create" && <Spinner />}
            <span>Create New Community</span>
          </button>
        </div>

        {/* Status messages */}
        {message && (
          <div
            className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
              message.type === "success"
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {message.type === "success" ? (
              <FaCheckCircle className="flex-shrink-0" />
            ) : (
              <FaTimesCircle className="flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}
      </motion.div>

      {/* Sign out button */}
      <button
        onClick={handleSignOut}
        className="absolute top-4 right-4 p-3 rounded-full bg-red-700/80 hover:bg-red-500 transition-all backdrop-blur-sm"
      >
        <FaSignOutAlt size={24} />
      </button>
    </div>
  );
};

export default CommunityOptions;
