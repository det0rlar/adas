// components/Skeletons/EventCardSkeleton.jsx
import React from "react";
import "./Skeleton.css"; // Ensure this file contains your shimmer/pulse styles

const EventCardSkeleton = () => {
  return (
    <div className="skeleton-card bg-gray-800 border border-gray-700 rounded-lg w-[380px] h-[420px] shadow-md animate-pulse">
      {/* Top half: Image skeleton */}
      <div className="w-full h-[65%] bg-gray-700 rounded-t-lg"></div>

      {/* Divider */}
      <div className="w-full h-px bg-gray-600"></div>

      {/* Bottom half: Details skeleton */}
      <div className="p-4 h-[35%] flex flex-col gap-2">
        {/* Event Title Skeleton */}
        <div className="skeleton-heading w-full"></div>

        {/* Location Skeleton */}
        <div className="skeleton-text w-3/4"></div>

        {/* Date and Type Skeleton (on the same line) */}
        <div className="flex justify-between gap-4">
          <div className="skeleton-text w-1/2"></div>
          <div className="skeleton-text w-1/2"></div>
        </div>
      </div>
    </div>
  );
};

export default EventCardSkeleton;
