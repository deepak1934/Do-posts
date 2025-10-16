import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      default: "Anonymous",
    },
    image: {
      type: String, // URL of the image stored on Cloudinary
    },
    imageId: {
      type: String, // Cloudinary public ID
    },
    votes: {
      type: Number,
      default: 0,
    },
    likedBy: {
  type: [String],
  default: [], // stores IPs who liked/disliked
},

    comments: [
      {
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    ip: {
      type: String,
      required: true, // store client IP for rate-limiting
    },
  },
  { timestamps: true } // automatically adds createdAt & updatedAt
);

const Post = mongoose.model("Post", postSchema);

export default Post;
