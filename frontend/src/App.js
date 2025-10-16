import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import Home from "./components/Home/Home";
import Feedback from "./components/feedback/Feedback";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <>
      <Navbar
        toggleSidebar={toggleSidebar}
        onCreatePostClick={() => setShowPostForm(true)}
        onSearch={(query) => setSearchQuery(query)}
      />

      <div className="app-layout" style={{ display: "flex" }}>
        <Sidebar className={sidebarOpen ? "open" : ""} />

        <div
          className="main-content"
          style={{
            flex: 1,
            padding: "1rem",
            marginLeft: sidebarOpen ? "220px" : "0",
            transition: "margin-left 0.3s",
          }}
        >
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  showForm={showPostForm}
                  setShowForm={setShowPostForm}
                  searchQuery={searchQuery}
                />
              }
            />
            <Route path="/feedback" element={<Feedback />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default App;
