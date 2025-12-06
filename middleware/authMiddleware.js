// // server/routes/auth.js
// const express = require("express");
// const router = express.Router();
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");

// const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@astechify.com";

// // POST /api/login
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ error: "Email and password required" });
//   }

//   try {
//     // 🔴 IMPORTANT: read ADMIN_HASH at request time
//     const adminHash = process.env.ADMIN_HASH;
//     if (!adminHash) {
//       console.error("ADMIN_HASH not set. Did you set ADMIN_PASSWORD and restart?");
//       return res.status(500).json({ error: "Admin not configured on server. Try again later." });
//     }

//     // check email
//     if (email.toLowerCase().trim() !== ADMIN_EMAIL.toLowerCase().trim()) {
//       return res.status(401).json({ error: "Invalid credentials" });
//     }

//     // check password
//     const match = await bcrypt.compare(password, adminHash);
//     if (!match) {
//       return res.status(401).json({ error: "Invalid credentials" });
//     }

//     // create token
//     const token = jwt.sign(
//       { role: "admin", email: ADMIN_EMAIL },
//       process.env.JWT_SECRET,
//       { expiresIn: "12h" }
//     );

//     return res.json({ token });
//   } catch (err) {
//     console.error("Auth error:", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// });

// module.exports = router;


// utils/authMiddleware.js
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization; // "Bearer token"
    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = { verifyToken };
