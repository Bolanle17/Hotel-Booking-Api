const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  img: { type: String, default: "uploads/avater.png" },
  role: { type: String, enum: ["admin", "client"], default: "client" },
});

module.exports = mongoose.model("User", userSchema);