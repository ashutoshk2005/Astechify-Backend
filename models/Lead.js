// const mongoose = require("mongoose");

// const LeadSchema = new mongoose.Schema({
//   name: { type: String, required: true, trim: true },
//   email: { type: String, required: true, trim: true },
//   service: { type: String, default: "Not specified" },
//   message: { type: String },
//   status: { type: String, default: "New" },
//   date: { type: String, default: () => new Date().toISOString().slice(0,10) },
// }, { timestamps: true });

// module.exports = mongoose.model("Lead", LeadSchema);



// models/Lead.js
const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    source: {
      type: String,
      default: "website",
    },
    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);
