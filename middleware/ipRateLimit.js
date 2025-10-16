// Simple in-memory IP tracker
const ipTracker = {};

const ipRateLimit = (req, res, next) => {
  if (req.method === "POST") {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    if (!ipTracker[ip]) {
      ipTracker[ip] = [];
    }

    // Keep only posts within the last 24 hours (optional)
    const now = Date.now();
    ipTracker[ip] = ipTracker[ip].filter((timestamp) => now - timestamp < 24 * 60 * 60 * 1000);

    if (ipTracker[ip].length >= 5) {
      return res.status(429).json({ message: "You have reached the posting limit for your IP." });
    }

    ipTracker[ip].push(now);
  }
  next();
};

export default ipRateLimit;
