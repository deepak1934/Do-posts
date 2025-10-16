import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import Comments from "./comments";
import "./PostModel.css";   

const modalRoot = document.getElementById("modal-root");

const PostModal = ({ post, onClose, setPosts }) => {
  // Close modal on Escape key & lock scrolling
  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKey);

    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [onClose]);

  if (!modalRoot) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        {/* Left: Post image or fallback */}
        <div className="modal-left">
          {post?.image ? (
            <img src={post.image} alt="post" className="modal-post-image" />
          ) : (
            <div className="modal-fallback">
              <h2 className="post-title">{post?.title}</h2>
              <p className="post-caption">{post?.body}</p>
            </div>
          )}
        </div>

        {/* Right: Post info + Comments */}
        <div className="modal-right">
          <div className="modal-post-info">
            <h2 className="post-title">{post?.title}</h2>
            <p className="post-caption">{post?.body}</p>
            <p className="modal-post-likes">Likes: {post?.votes || 0}</p>
          </div>

          {/* Comments Section */}
          <Comments post={post} setPosts={setPosts} />
        </div>
      </div>
    </div>,
    modalRoot
  );
};

export default PostModal;
