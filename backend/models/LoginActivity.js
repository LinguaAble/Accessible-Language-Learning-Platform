const mongoose = require("mongoose");

const loginActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  ip: String,
  country: String,
  city: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("LoginActivity", loginActivitySchema);
