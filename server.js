// // server.js
// require("dotenv").config();
// const express = require("express");
// const mongoose = require("mongoose");
// const helmet = require("helmet");
// const cors = require("cors");
// const rateLimit = require("express-rate-limit");
// const path = require("path");

// const leadRoutes = require("./routes/leads");
// const authRoutes = require("./routes/auth");
// const { ensureAdminHash } = require("./utils/adminSetup");

// const app = express();
// const PORT = process.env.PORT || 5000;

// // 1) Prepare admin hash from ADMIN_EMAIL + ADMIN_PASSWORD
// ensureAdminHash();

// // 2) Middleware
// app.use(helmet());
// app.use(express.json({ limit: "10kb" }));
// app.use(express.urlencoded({ extended: true }));

// // CORS: allow all in dev, restrict in prod
// const corsOptions = {
//   origin:
//     process.env.NODE_ENV === "production"
//       ? [
//           "https://astechifysolutions.com",        // your custom domain
//           "https://your-frontend.vercel.app",      // <-- update with real Vercel URL
//         ]
//       : true,
//   credentials: true,
// };
// app.use(cors(corsOptions));

// // Rate limiter
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 200,
// });
// app.use(limiter);

// // 3) Connect to MongoDB Atlas
// const connectWithRetry = async (retries = 0) => {
//   const uri = process.env.MONGODB_URI;
//   if (!uri) {
//     console.warn("MONGODB_URI not set in environment variables.");
//     return;
//   }

//   try {
//     await mongoose.connect(uri, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("✅ MongoDB connected");
//   } catch (err) {
//     console.error("❌ MongoDB connection error:", err.message);
//     if (retries < 5) {
//       console.log(`Retrying MongoDB connection in 3s... (${retries + 1})`);
//       setTimeout(() => connectWithRetry(retries + 1), 3000);
//     } else {
//       console.warn("Could not connect to MongoDB after several attempts.");
//     }
//   }
// };

// connectWithRetry();

// // 4) Routes
// app.use("/api/leads", leadRoutes);
// app.use("/api", authRoutes);

// // Health check
// app.get("/health", (req, res) => res.json({ status: "ok" }));

// // 5) Serve frontend build in production (optional)
// if (process.env.NODE_ENV === "production") {
//   const clientBuildPath = path.join(__dirname, "../dist");
//   app.use(express.static(clientBuildPath));
//   app.get("*", (req, res) => {
//     res.sendFile(path.join(clientBuildPath, "index.html"));
//   });
// }

// // 6) Global error handler
// app.use((err, req, res, next) => {
//   console.error("Unhandled error:", err);
//   res.status(500).json({ error: "Server error" });
// });

// // 7) Start server (ONLY ONCE)
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });



// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// === Middleware ===
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS: allow all for now (you can restrict later)
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// === MongoDB Connection ===
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("❌ MONGODB_URI is not set in environment variables.");
  process.exit(1);
}

mongoose
  .connect(uri)
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// === Lead Model (inline) ===
const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    service: { type: String, default: "Not specified" },
    message: { type: String, required: true, trim: true },
    source: { type: String, default: "website" },
    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new",
    },
  },
  { timestamps: true }
);

const Lead = mongoose.model("Lead", leadSchema);

// === Routes ===

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Save lead (contact form)
app.post("/api/leads", async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ error: "Name, email, and message are required" });
    }

    const lead = await Lead.create({
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || "",
      service: service || "Not specified",
      message: message.trim(),
      source: "website",
    });

    res.status(201).json({
      message: "Lead submitted successfully",
      lead,
    });
  } catch (err) {
    console.error("Error creating lead:", err);
    res.status(500).json({ error: "Failed to submit lead" });
  }
});

// ⬇️ NEW — Fetch leads for Admin Dashboard
app.get("/api/leads", async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    console.error("Error fetching leads:", err);
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

// === Start server ===
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
