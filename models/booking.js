const { required } = require("joi")
const mongoose = require("mongoose")


const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingId: {
    type: String,
    required: true,
    unique: true
  },
  Name: {
    type: String,
    required: true
  },
  phone: String,
  address: String,
  rooms: [{
    roomType: String,
    numberOfRooms: {
      type: Number,
      default: 1
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room'
    }
  }],
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    required: true},
  date: {type: Date, default: Date.now},
  checkInDate: Date,
  checkOutDate: Date,
  email: String,
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  guests: Number
}, {
  timestamps: true
});
module.exports = mongoose.model("Booking", BookingSchema)