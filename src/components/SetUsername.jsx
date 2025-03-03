import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '../../config/firebase'; // Import Firestore and Auth
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const SetUsername = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [whatsapp, setWhatsapp] = useState(''); // State for WhatsApp number
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Function to validate the username
  const isValidUsername = (username) =>
    /^[a-zA-Z0-9_]{3,20}$/.test(username); // Allows letters, numbers, underscores, 3-20 chars

  // Function to validate the WhatsApp number
  const isValidWhatsapp = (whatsapp) =>
    /^\+?[0-9]{10,15}$/.test(whatsapp); // Allows 10-15 digits, optional "+" prefix

  const handleSetUsername = async () => {
    if (!username.trim()) {
      setErrorMessage('Username cannot be empty.');
      return;
    }
    if (!isValidUsername(username)) {
      setErrorMessage('Username must be 3-20 characters long and can only include letters, numbers, and underscores.');
      return;
    }
    if (!whatsapp.trim()) {
      setErrorMessage('WhatsApp number cannot be empty.');
      return;
    }
    if (!isValidWhatsapp(whatsapp)) {
      setErrorMessage('Invalid WhatsApp number. Please enter a valid phone number (10-15 digits).');
      return;
    }

    try {
      // Update the user's profile with the username
      await updateProfile(user, { displayName: username });

      // Store additional data in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        username: username,
        email: user.email || '', // Get email from Firebase Auth
        whatsapp: whatsapp,
        joinedCommunities: [], // Initialize as an empty array
        createdCommunities: [], // Initialize as an empty array
      });

      setSuccessMessage(true);
      setErrorMessage(''); // Clear any previous error messages

      // Redirect to the community options page after a delay
      setTimeout(() => {
        navigate('/communityoptions');
      }, 2000);
    } catch (error) {
      console.error('Error setting username and WhatsApp:', error);
      setErrorMessage('Failed to set username and WhatsApp. Please try again.');
    }
  };

  return (
    <div className="relative flex items-center justify-center w-full h-screen bg-gradient-to-br from-gray-900 to-black">
      <div className="w-[90%] max-w-[500px] p-8 bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
        <h2 className="text-3xl font-bold text-purple-400 text-center mb-6">Set Your Profile</h2>
        <p className="text-gray-400 text-center mb-6">Complete your profile to get started.</p>

        {/* Username Input Field */}
        <div className="relative mb-4">
          <label htmlFor="username" className="sr-only">
            Enter your username
          </label>
          <input
            id="username"
            type="text"
            placeholder="Enter your username..."
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setErrorMessage(''); // Clear error message on input change
            }}
            className={`w-full p-3 pl-10 rounded-lg bg-gray-900 text-white border ${
              errorMessage ? 'border-red-500' : 'border-gray-600'
            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
            aria-invalid={errorMessage ? 'true' : 'false'}
            aria-describedby={errorMessage ? 'error-message' : null}
          />
        </div>

        {/* WhatsApp Input Field */}
        <div className="relative mb-4">
          <label htmlFor="whatsapp" className="sr-only">
            Enter your WhatsApp number
          </label>
          <input
            id="whatsapp"
            type="text"
            placeholder="Enter your WhatsApp number..."
            value={whatsapp}
            onChange={(e) => {
              setWhatsapp(e.target.value);
              setErrorMessage(''); // Clear error message on input change
            }}
            className={`w-full p-3 pl-10 rounded-lg bg-gray-900 text-white border ${
              errorMessage ? 'border-red-500' : 'border-gray-600'
            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
            aria-invalid={errorMessage ? 'true' : 'false'}
            aria-describedby={errorMessage ? 'error-message' : null}
          />
        </div>

        {/* Error Message */}
        {errorMessage && (
          <p id="error-message" className="mt-2 text-sm text-red-500">
            <FaExclamationTriangle className="inline mr-1" /> {errorMessage}
          </p>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSetUsername}
          disabled={!username || !isValidUsername(username) || !whatsapp || !isValidWhatsapp(whatsapp)}
          className={`w-full py-3 text-white rounded-lg font-semibold text-lg ${
            !username || !isValidUsername(username) || !whatsapp || !isValidWhatsapp(whatsapp)
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-500'
          }`}
        >
          Complete Profile
        </button>

        {/* Success Message */}
        {successMessage && (
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-black text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <FaCheckCircle className="text-green-500" />
            Profile completed successfully!
          </div>
        )}
      </div>
    </div>
  );
};

export default SetUsername;