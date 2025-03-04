// src/components/ProfilePage.jsx
import React, { useState } from 'react';
import { FiEdit, FiUpload, FiCalendar, FiMapPin } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('info');
  const [profileData, setProfileData] = useState({
    name: 'Sarah Johnson',
    bio: 'Passionate about creating unforgettable experiences. Life is about vibrant moments, deep connections, and celebrating every day.',
    email: 'sarah@example.com',
    location: 'New York, NY',
    image:
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=300&q=80'
  });
  const [events] = useState([
    { id: 1, title: 'Summer Music Fest', date: '2024-07-15', location: 'Central Park' },
    { id: 2, title: 'Tech Conference', date: '2024-08-20', location: 'Javits Center' },
    { id: 3, title: 'Food & Wine Expo', date: '2024-09-05', location: 'Pier 94' }
  ]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileData({ ...profileData, image: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans relative overflow-hidden">
      {/* Background Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 opacity-80 pointer-events-none"></div>

      {/* Header */}
      <header className="relative bg-gray-800 h-48 flex items-center justify-center shadow-md">
        <div className="text-center">
          <h1 className="text-4xl">Profile Page</h1>
          <p className="mt-2 text-sm">Welcome to your profile page edit info as much as you want</p>
        </div>
      </header>

      {/* Profile Card */}
      <div className="relative max-w-4xl mx-auto -mt-20 px-4">
        <div className="bg-gray-800 rounded-xl shadow-xl p-8 border border-gray-700">
          <div className="flex flex-col md:flex-row items-center">
            {/* Profile Image */}
            <div className="relative">
              <img
                src={profileData.image}
                alt="Profile"
                className="w-40 h-40 rounded-full border-4 border-gray-600 object-cover"
              />
              <label
                htmlFor="profileImageInput"
                className={`absolute inset-0 flex flex-col items-center justify-center rounded-full transition-opacity cursor-pointer ${
                  isEditing
                    ? "bg-indigo-600 bg-opacity-70 opacity-100"
                    : "bg-black bg-opacity-50 opacity-0 hover:opacity-100"
                }`}
              >
                <FiUpload className="text-white text-3xl" />
                <span className="mt-1 text-sm">Change Photo</span>
              </label>
              <input
                id="profileImageInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            {/* Profile Info */}
            <div className="mt-6 md:mt-0 md:ml-8 flex-1">
              <div className="flex items-center justify-between">
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    className="text-3xl font-bold bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 focus:outline-none"
                  />
                ) : (
                  <h2 className="text-3xl font-bold">{profileData.name}</h2>
                )}
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="ml-4 px-4 py-2 bg-blue-600 rounded-full shadow hover:bg-blue-700 transition"
                >
                  {isEditing ? 'Save' : 'Edit'}
                </button>
              </div>
              <p className="mt-2 flex items-center text-gray-400">
                <FiMapPin className="mr-1" />
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) =>
                      setProfileData({ ...profileData, location: e.target.value })
                    }
                    className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 focus:outline-none"
                  />
                ) : (
                  profileData.location
                )}
              </p>
              <div className="mt-4">
                {isEditing ? (
                  <textarea
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData({ ...profileData, bio: e.target.value })
                    }
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded p-2 focus:outline-none"
                    rows="3"
                  />
                ) : (
                  <p className="text-gray-300">{profileData.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-8">
            <nav className="flex border-b border-gray-700">
              <button
                onClick={() => setSelectedTab('info')}
                className={`py-2 px-4 font-medium transition-colors ${
                  selectedTab === 'info'
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Profile Info
              </button>
              <button
                onClick={() => setSelectedTab('events')}
                className={`py-2 px-4 font-medium transition-colors ${
                  selectedTab === 'events'
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Hosted Events
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {selectedTab === 'info' && (
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="w-40 font-medium">Email:</span>
                  <span className="text-gray-300">{profileData.email}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-40 font-medium">Location:</span>
                  <span className="text-gray-300">{profileData.location}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-40 font-medium">Bio:</span>
                  <span className="text-gray-300">{profileData.bio}</span>
                </div>
              </div>
            )}
            {selectedTab === 'events' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="bg-gray-800 rounded-xl p-4 shadow-lg transform hover:-translate-y-1 transition-transform"
                  >
                    <h3 className="text-xl font-semibold">{event.title}</h3>
                    <p className="mt-2 flex items-center text-gray-400">
                      <FiCalendar className="mr-2" /> {event.date}
                    </p>
                    <p className="mt-1 flex items-center text-gray-400">
                      <FiMapPin className="mr-2" /> {event.location}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 py-6 bg-gray-800">
        <div className="max-w-4xl mx-auto text-center text-gray-500">
          &copy; {new Date().getFullYear()} Adas. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default ProfilePage;
