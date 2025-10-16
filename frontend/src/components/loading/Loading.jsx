import React from "react";
import "./Loading.css"; // create this CSS file for styles

const Loading = () => {
  return (
    <div className="loading-overlay">
      <div className="spinner"></div>
      <p>Posting your content...</p>
    </div>
  );
};

export default Loading;
