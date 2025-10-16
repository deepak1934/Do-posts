import connectDB from "../connection/connection.js";
import { cloudinary } from "../config/cloudinary.js";
import Post from "../models/posts.js";
import multer from "multer";

// ------------------- Multer memory storage -------------------
const upload = multer({ storage: multer.memoryStorage() });

// ------------------- Constants -------------------
const MAX_POSTS_PER_IP = 5;
const MAX_TOTAL_POSTS = 200;

// ------------------- Helper -------------------
const getClientIP = (req) => req.headers["x-forwarded-for"] || req.socket.remoteAddress;

// ------------------- Serverless Handler -------------------
export default async function handler(req, res) {
  await connectDB();

  try {
    const { method, query } = req;

    // ------------------- GET POSTS -------------------
    if (method === "GET") {
      if (query.search) {
        const regex = new RegExp(query.search, "i");
        const posts = await Post.find({
          $or: [{ title: regex }, { body: regex }, { author: regex }],
        }).sort({ createdAt: -1 });
        return res.status(200).json(posts);
      } else {
        const posts = await Post.find().sort({ createdAt: -1 });
        return res.status(200).json(posts);
      }
    }

    // ------------------- CREATE POST -------------------
    if (method === "POST" && !query.action) {
      await new Promise((resolve, reject) => {
        upload.single("image")(req, res, (err) => (err ? reject(err) : resolve()));
      });

      const { title, body, author } = req.body;
      const ip = getClientIP(req);

      const postsByIp = await Post.find({ ip });
      if (postsByIp.length >= MAX_POSTS_PER_IP)
        return res.status(429).json({ message: `Max ${MAX_POSTS_PER_IP} posts per IP reached` });

      let imageUrl = null;
      let imageId = null;

      if (req.file) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ folder: "posts" }, (err, result) =>
            err ? reject(err) : resolve(result)
          );
          stream.end(req.file.buffer);
        });
        imageUrl = result.secure_url;
        imageId = result.public_id;
      }

      const newPost = await Post.create({ title, body, author: author || "Anonymous", image: imageUrl, imageId, ip });

      const totalPosts = await Post.find().sort({ createdAt: 1 });
      if (totalPosts.length > MAX_TOTAL_POSTS) {
        const postsToDelete = totalPosts.slice(0, totalPosts.length - MAX_TOTAL_POSTS);
        for (const post of postsToDelete) {
          if (post.imageId) await cloudinary.uploader.destroy(post.imageId);
          await Post.findByIdAndDelete(post._id);
        }
      }

      return res.status(201).json(newPost);
    }

    // ------------------- DELETE POST -------------------
    if (method === "DELETE" && query.id) {
      const post = await Post.findById(query.id);
      if (!post) return res.status(404).json({ message: "Post not found" });

      if (post.imageId) await cloudinary.uploader.destroy(post.imageId);
      await Post.findByIdAndDelete(query.id);

      return res.json({ message: "Post deleted successfully" });
    }

    // ------------------- LIKE / DISLIKE / COMMENT -------------------
    if (method === "POST" && query.action && query.id) {
      const post = await Post.findById(query.id);
      if (!post) return res.status(404).json({ message: "Post not found" });

      const ip = getClientIP(req);

      if (query.action === "like") {
        if (!post.likedBy) post.likedBy = [];
        if (post.likedBy.includes(ip))
          return res.status(429).json({ message: "You already liked" });

        post.votes = (post.votes || 0) + 1;
        post.likedBy.push(ip);
        await post.save();
        return res.json(post);
      }

      if (query.action === "dislike") {
        if (!post.likedBy) post.likedBy = [];
        if (post.likedBy.includes(ip))
          return res.status(429).json({ message: "You already liked/disliked this post" });
s
        post.votes = (post.votes || 0) - 1;
        post.likedBy.push(ip);
        await post.save();
        return res.json(post);
      }

if (query.action === "comment") {
  // Use multer to parse form-data
  await new Promise((resolve, reject) => {
    upload.none()(req, res, (err) => (err ? reject(err) : resolve()));
  });

  const { text, author } = req.body;
  if (!text || !text.trim())
    return res.status(400).json({ message: "Comment text required" });

  const newComment = {
    text,
    author: author || "Anonymous",
    createdAt: new Date(),
  };

  post.comments.push(newComment);
  await post.save();

  return res.status(201).json(newComment);
}


    }

    return res.status(405).json({ message: `Method ${method} not allowed` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
}

// ------------------- Disable Next.js default body parser -------------------
export const config = { api: { bodyParser: false } };
