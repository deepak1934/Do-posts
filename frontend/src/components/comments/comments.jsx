import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const Comments = ({ post, setPosts }) => {
  const [text, setText] = useState("");
  const commentsEndRef = useRef(null);

  // Scroll to bottom when comments update
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [post.comments]);

  const addComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    // Temporary comment for UI update
    const tempComment = {
      _id: Math.random().toString(36).substr(2, 9),
      text,
      author: "You",
      createdAt: new Date(),
    };

    // Optimistic UI: add temp comment immediately
    setPosts((prev) =>
      prev.map((p) =>
        p._id === post._id
          ? { ...p, comments: [...(p.comments || []), tempComment] }
          : p
      )
    );

    setText(""); // clear input

    try {
      // Send as FormData because backend uses multer
      const formData = new FormData();
      formData.append("text", tempComment.text);
      formData.append("author", tempComment.author);

      const res = await axios.post(
        `${window.location.origin}/api/posts?id=${post._id}&action=comment`,
        formData
      );

      // Replace temp comment with server response
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id !== post._id) return p;
          const filteredComments = p.comments.filter((c) => c._id !== tempComment._id);
          return { ...p, comments: [...filteredComments, res.data] };
        })
      );
    } catch (err) {
      // Remove temp comment if error
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id !== post._id) return p;
          return {
            ...p,
            comments: p.comments.filter((c) => c._id !== tempComment._id),
          };
        })
      );
      alert(err.response?.data?.message || "Failed to add comment");
    }
  };

  return (
    <div className="comments-section">
      <div className="comments-list">
        {post.comments?.map((c, idx) => (
          <p key={c._id || idx} className="comment-item">
            <span className="comment-author">{c.author || "Anonymous"}:</span>{" "}
            {c.text}
          </p>
        ))}
        <div ref={commentsEndRef} />
      </div>

      <form className="comment-form" onSubmit={addComment}>
        <input
          type="text"
          placeholder="Add a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">Post</button>
      </form>
    </div>
  );
};

export default Comments;
