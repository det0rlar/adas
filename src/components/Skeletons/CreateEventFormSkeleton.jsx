// components/CreateEventFormSkeleton.js
import React from "react";
import "./Skeleton.css"; // adjust the path to where your skeleton CSS is located

const CreateEventFormSkeleton = () => {
  return (
    <div className="flex items-center justify-center w-full bg-gradient-to-br from-gray-900 to-black min-h-screen relative">
      <div
        className="skeleton-container"
        style={{ height: "90vh" }} // Increase the height to 90% of the viewport height
      >
        {/* Simulated long content */}
        <div
          className="skeleton-heading"
          style={{ height: "60px", marginBottom: "20px" }}
        ></div>
        <div
          className="skeleton-text"
          style={{ height: "20px", marginBottom: "16px" }}
        ></div>
        <div
          className="skeleton-text"
          style={{ height: "20px", marginBottom: "16px" }}
        ></div>
        <div
          className="skeleton-divider"
          style={{ height: "2px", margin: "20px 0" }}
        ></div>
        {/* Additional skeleton text lines */}
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={index}
            className="skeleton-text"
            style={{ height: "20px", marginBottom: "16px" }}
          ></div>
        ))}
        <div className="skeleton-buttons" style={{ marginTop: "20px" }}>
          <div
            className="skeleton-button"
            style={{ width: "100px", height: "40px", marginRight: "16px" }}
          ></div>
          <div
            className="skeleton-button"
            style={{ width: "100px", height: "40px" }}
          ></div>
          <div
            className="skeleton-text"
            style={{ height: "20px", marginBottom: "16px" }}
          ></div>
          <div
            className="skeleton-text"
            style={{ height: "20px", marginBottom: "16px" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default CreateEventFormSkeleton;
