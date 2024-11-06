const { required } = require("joi")
const mongoose = require("mongoose")
const BookingSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
  bookingId: {type: String, required: true},
  Name: {type: String, required: true},
  phone: {type: String, required: true},
  address: {type: String, required: true},
  rooms:[{
    roomType: {type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true},
    numberOfRooms: {type: Number, required: true},
  }],
  amount: {type: Number, required: true},
  status: {type: String, default: "pending"},
  transactionId: {type: String, unique: true},
  date: {type: Date, default: Date.now},
  checkInDate: {type: Date, required: true},
  checkOutDate: {type: Date, required: true},
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel'},
  email: {type: String},
  guests: {type: Number, required: true}
})

module.exports = mongoose.model("Booking", BookingSchema)