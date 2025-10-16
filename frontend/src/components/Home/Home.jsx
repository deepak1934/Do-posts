import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Home.css";
import PostModal from "../comments/PostModel";
import Loading from "../loading/Loading";

const Home = ({ showForm, setShowForm, searchQuery }) => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentWord, setCurrentWord] = useState(0);
  const [activePost, setActivePost] = useState(null);

  const words = ["Post", "Thoughts"];
  const stableWord = "Share";

  // Empty state animation
  useEffect(() => {
    if (filteredPosts.length === 0 && !showForm) {
      const interval = setInterval(() => {
        setCurrentWord((prev) => (prev + 1) % words.length);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [filteredPosts.length, showForm, words.length]);

  // Fetch posts
  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${window.location.origin}/api/posts`);
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Filter posts for search
  useEffect(() => {
    if (!searchQuery) {
      setFilteredPosts(posts);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredPosts(
        posts.filter(
          (post) =>
            post.title.toLowerCase().includes(query) ||
            post.body.toLowerCase().includes(query) ||
            (post.author && post.author.toLowerCase().includes(query))
        )
      );
    }
  }, [posts, searchQuery]);

  // Submit new post
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !body || loading) return;

    setLoading(true);
    try {
      let imageBase64 = null;
      if (image) {
        const reader = new FileReader();
        reader.readAsDataURL(image);
        await new Promise((resolve, reject) => {
          reader.onload = () => {
            imageBase64 = reader.result.split(",")[1]; // remove prefix
            resolve();
          };
          reader.onerror = (err) => reject(err);
        });
      }

      const res = await axios.post(`${window.location.origin}/api/posts`, {
        title,
        body,
        author,
        imageBase64,
      });

      setPosts((prev) => [res.data, ...prev]);
      setTitle("");
      setBody("");
      setAuthor("");
      setImage(null);
      setMessage("Post created successfully!");
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  // Handle like/dislike
  const handleVote = async (postId, action) => {
    try {
      const res = await axios.post(
        `${window.location.origin}/api/posts?id=${postId}&action=${action}`
      );
      setPosts((prev) => prev.map((p) => (p._id === postId ? res.data : p)));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || `Failed to ${action} post`);
    }
  };

  // Handle adding comment
  const handleComment = async (postId, text) => {
    if (!text) return;
    try {
      const res = await axios.post(
        `${window.location.origin}/api/posts?id=${postId}&action=comment`,
        { text }
      );
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, comments: [...p.comments, res.data] }
            : p
        )
      );
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add comment");
    }
  };

  return (
    <div className="home-container">
      {loading && <Loading />}

      {filteredPosts.length === 0 && !showForm && (
        <div className="empty-state">
          <h1 className="empty-heading">
            <span className="stable-word">{stableWord} </span>
            <span className="animated-word">{words[currentWord]}</span>
          </h1>
          <p className="empty-subtitle">Start sharing your thoughts!</p>
        </div>
      )}

      {showForm && (
        <div className="post-popup-overlay">
          <div className="post-popup-card">
            <h2>Create New Post</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Author (optional)"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
              <textarea
                placeholder="Content"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
              />
              <div className="popup-buttons">
                <button type="submit" disabled={loading}>
                  {loading ? "Posting..." : "Post"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
              {message && <p className="message">{message}</p>}
            </form>
          </div>
        </div>
      )}

      {filteredPosts.length > 0 && (
        <div className="posts-feed">
          {filteredPosts.map((post) => (
            <div key={post._id} className="post-card">
              <h2>{post.title}</h2>
              <p className="author">
                Author: {post.author || "Anonymous"}{" "}
                <span className="post-date">
                  • {new Date(post.createdAt).toLocaleString()}
                </span>
              </p>
              <p>{post.body}</p>
              {post.image && (
                <img src={post.image} alt="post" className="post-image" />
              )}

              <div className="post-footer">
                <div className="votes">
                  <button onClick={() => handleVote(post._id, "like")}>⬆️</button>
                  <span>{post.votes || 0}</span>
                  <button onClick={() => handleVote(post._id, "dislike")}>
                    ⬇️
                  </button>
                </div>

                <div
                  className="comments-icon"
                  onClick={() => setActivePost(post)}
                >
                  💬 {post.comments?.length || 0}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

     {activePost && (
  <PostModal
    post={activePost}
    setPosts={setPosts}
    onClose={() => setActivePost(null)}
  />
)}

    </div>
  );
};

export default Home;

   