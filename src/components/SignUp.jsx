import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaArrowLeft } from 'react-icons/fa';
import { signUpWithEmailPassword } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

const SignUp = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await signUpWithEmailPassword(email, password);
      alert('Account created successfully! Please log in.');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="relative flex items-center justify-center w-full h-screen bg-gradient-to-br from-gray-900 to-black">
      <div className="absolute top-4 left-4 flex gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white">
          <FaArrowLeft size={24} />
        </button>
      </div>
      <div className="w-[90%] max-w-[500px] p-8 bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
        <h2 className="text-3xl font-bold text-purple-400 text-center mb-6">Create an Account</h2>
        <div className="relative mb-4">
          <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            placeholder="Enter your email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 pl-10 rounded-lg bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="relative mb-4">
          <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="password"
            placeholder="Enter your password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 pl-10 rounded-lg bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="relative mb-4">
          <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="password"
            placeholder="Confirm your password..."
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 pl-10 rounded-lg bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button onClick={handleSignup} className="w-full py-3 text-white bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold text-lg">
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default SignUp;
