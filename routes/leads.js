const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");
const auth = require("../middleware/auth");

// public: create a lead
router.post("/", async (req, res) => {
  try {
    const { name, email, service, message } = req.body;
    if (!name || !email) return res.status(400).json({ error: "Name and email required" });

    const lead = new Lead({ name, email, service, message });
    await lead.save();
    return res.status(201).json(lead);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// protected: get all leads
router.get("/", auth, async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// protected: update status
router.patch("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const lead = await Lead.findByIdAndUpdate(id, updates, { new: true });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// protected: delete lead
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    await Lead.findByIdAndDelete(id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
