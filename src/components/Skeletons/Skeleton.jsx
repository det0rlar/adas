// Skeleton.js
import React from 'react';
import './Skeleton.css'; // Define CSS styles here

const SkeletonButton = () => {
  return <div className="skeleton-button"></div>;
};

const SkeletonInput = () => {
  return <div className="skeleton-input"></div>;
};

const Skeleton = () => {
  return (
    <div className="skeleton-container">
      <div className="skeleton-heading"></div>
      <div className="skeleton-text"></div>
      <div className="skeleton-divider"></div>
      <div className="skeleton-buttons">
        <SkeletonButton />
        <SkeletonButton />
      </div>
      <SkeletonInput />
      <SkeletonInput />
      <div className="skeleton-text"></div>
      <SkeletonButton />
      <div className="skeleton-text"></div>
    </div>
  );
};

export default Skeleton;