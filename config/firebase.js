// config/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth"; // Include OAuthProvider for Apple Sign-In
import { getFirestore, collection } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Import Firebase Storage

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // Note: getAnalytics is only available in environments that support window global objects
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Initialize Firebase Storage

// Auth providers
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider("apple.com"); // Setup for Apple Sign-In

// Export the posts collection reference
export const postsCollection = collection(db, "posts");

// Use signInWithPopup for Facebook, Google, and Apple
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signInWithApple = () => signInWithPopup(auth, appleProvider); // Added for Apple Sign-In
export const signInWithEmailPassword = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);
export const signUpWithEmailPassword = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);
