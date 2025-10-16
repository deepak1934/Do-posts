import mongoose from "mongoose";
import Post from "../models/Post.js"; // adjust path if needed

const MONGO_URI = process.env.MONGO_URI;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return; // already connected
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
}

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "POST") {
    try {
      const newPost = new Post(req.body);
      await newPost.save();
      res.status(201).json({ success: true, post: newPost });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  } else if (req.method === "GET") {
    try {
      const posts = await Post.find();
      res.status(200).json({ success: true, posts });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
