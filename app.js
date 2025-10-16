import express from "express";
import cors from "cors";
import connection from "./connection/connection.js";
import postRoutes from "./routes/post.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connection();

// Serve React static files
app.use(express.static(path.join(__dirname, "frontend", "build")));

// API routes
app.use("/api/posts", postRoutes);

// Catch-all route for React (excluding API routes)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
