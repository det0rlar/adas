// pages/EventsSkeleton.js
import React from "react";
import EventCardSkeleton from "./EventCardSkeleton";

const EventsSkeleton = () => {
  return (
    <div className="events-page bg-black min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      {/* Fixed Header Skeleton */}
      <div className="sticky top-0 left-0 right-0 z-50 bg-black bg-opacity-95 border-b border-white p-4 shadow-md mb-8">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex flex-wrap gap-4 flex-1">
            {/* Simulated search inputs */}
            <div
              className="py-3 px-4 bg-gray-700 rounded-lg animate-pulse flex-grow min-w-[200px]"
              style={{ height: "48px" }}
            ></div>
            <div
              className="py-3 px-4 bg-gray-700 rounded-lg animate-pulse flex-grow min-w-[200px]"
              style={{ height: "48px" }}
            ></div>
            <div
              className="py-3 px-4 bg-gray-700 rounded-lg animate-pulse w-[150px]"
              style={{ height: "48px" }}
            ></div>
          </div>
          <div className="flex items-center gap-4">
            {/* Simulated Dashboard button */}
            <div
              className="py-3 px-6 bg-gray-700 rounded-lg animate-pulse"
              style={{ height: "48px", width: "150px" }}
            ></div>
            {/* Simulated Create Event button */}
            <div
              className="py-3 px-6 bg-gray-700 rounded-lg animate-pulse"
              style={{ height: "48px", width: "150px" }}
            ></div>
          </div>
        </div>
      </div>

      {/* Spacer for the fixed header */}
      <div className="h-24"></div>

      {/* Latest Event Carousel Skeleton */}
      <div
        className="p-20 rounded-lg mb-8"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 34px, #9dedf0 1px), repeating-linear-gradient(90deg, transparent, transparent 34px, #33bbcf 1px)",
        }}
      >
        <h2 className="text-2xl font-bold text-purple-400 mb-4">
          Latest Event
        </h2>
        <div className="flex flex-nowrap gap-6 overflow-x-auto pb-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="min-w-[30%] flex-shrink-0">
              <EventCardSkeleton />
            </div>
          ))}
        </div>
      </div>

      {/* Older Events Grid Skeleton */}
      {/* Older Events Grid Skeleton */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-purple-400 mb-4">
          Older Events
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <EventCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventsSkeleton;
