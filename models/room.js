const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomType: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true }
});

module.exports = mongoose.model("Room", roomSchema);
