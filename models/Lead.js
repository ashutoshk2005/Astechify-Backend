const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  service: { type: String, default: "Not specified" },
  message: { type: String },
  status: { type: String, default: "New" },
  date: { type: String, default: () => new Date().toISOString().slice(0,10) },
}, { timestamps: true });

module.exports = mongoose.model("Lead", LeadSchema);
