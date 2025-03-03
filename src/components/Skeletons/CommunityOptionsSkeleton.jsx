import React from "react";
import "./Skeleton.css";

const CommunityOptionsSkeleton = () => {
  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center overflow-hidden">
      {/* Background placeholder */}
      <div className="absolute w-80 h-80 flex items-center justify-center">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-white opacity-50"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "linear-gradient(90deg, #2c2c2c, #3d3d3d, #2c2c2c)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
            }}
          />
        ))}
      </div>

      {/* Main content card skeleton */}
      <div className="skeleton-container relative z-10 p-8 rounded-xl shadow-2xl max-w-md w-full">
        {/* Heading skeleton */}
        <div className="skeleton-heading mb-6" />
        {/* Input field skeleton */}
        <div className="mb-6">
          <div className="skeleton-input mb-4" />
          <div className="skeleton-button w-full h-10 rounded-lg" />
        </div>
        {/* Action buttons skeleton */}
        <div className="space-y-4">
          <div className="skeleton-button w-full h-10 rounded-lg" />
          <div className="skeleton-button w-full h-10 rounded-lg" />
        </div>
        {/* Status message skeleton */}
        <div className="mt-4">
          <div className="skeleton-text h-8 rounded-lg" />
        </div>
      </div>
      {/* Sign out button skeleton */}
      <div
        className="absolute top-4 right-4 p-3 rounded-full"
        style={{
          width: "40px",
          height: "40px",
          background: "linear-gradient(90deg, #2c2c2c, #3d3d3d, #2c2c2c)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
        }}
      />
    </div>
  );
};

export default CommunityOptionsSkeleton;