import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ onCreatePostClick, onSearch }) => {
  const [themeIndex, setThemeIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState(""); // new state for search
  const themes = ["dark", "gray", "red"];

  const toggleTheme = () => {
    const nextIndex = (themeIndex + 1) % themes.length;
    setThemeIndex(nextIndex);
    document.body.classList.remove("gray-theme", "red-theme", "light-theme");
    if (themes[nextIndex] === "gray") document.body.classList.add("gray-theme");
    else if (themes[nextIndex] === "red") document.body.classList.add("red-theme");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery); // send query to parent
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          MiniReddit
        </Link>
      </div>

      <div className="navbar-search">
        <form onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="navbar-actions">
        <button onClick={toggleTheme}>🌗 Theme</button>
        <button onClick={onCreatePostClick}>➕ Create Post</button>
      </div>
    </nav>
  );
};

export default Navbar;
