// Sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ className = "" }) => {
  return (
    <div className={`sidebar ${className}`}>
      <div className="sidebar-section">
        <h3>Home</h3>
        <ul>
          <li>
            <Link to="/feedback">📩 Feedback</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
