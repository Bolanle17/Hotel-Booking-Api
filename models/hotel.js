const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  area: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true }
});

const hotelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    img: { type: String, required: true },
    description: { type: String, required: true },
    amenities: [{ type: String }],
    address: addressSchema,
    gallery: [{ type: String }],
    rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }]
});

module.exports = mongoose.model("Hotel", hotelSchema);