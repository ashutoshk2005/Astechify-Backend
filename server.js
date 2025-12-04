// server/server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");

const leadRoutes = require("./routes/leads");
const authRoutes = require("./routes/auth");
const { ensureAdminHash } = require("./utils/adminSetup");

const app = express();
const PORT = process.env.PORT || 5000;

// 1) Prepare admin hash from ADMIN_PASSWORD
ensureAdminHash();

// 2) Middleware
app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// CORS: allow all in dev, restrict in prod
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? "https://astechifysolutions.com"
      : true,
  credentials: true,
};
app.use(cors(corsOptions));

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});
app.use(limiter);

// 3) Connect to MongoDB
const connectWithRetry = async (retries = 0) => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("MONGODB_URI not set in .env - skipping DB connection.");
    return;
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    if (retries < 5) {
      console.log(`Retrying MongoDB connection in 3s... (${retries + 1})`);
      setTimeout(() => connectWithRetry(retries + 1), 3000);
    } else {
      console.warn("Could not connect to MongoDB after several attempts.");
    }
  }
};

connectWithRetry();

// 4) Routes
app.use("/api/leads", leadRoutes);
app.use("/api", authRoutes);

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// 5) Optional: serve frontend build in production
if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(__dirname, "../dist");
  app.use(express.static(clientBuildPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

// 6) Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Server error" });
});

// 7) Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
