const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingId: {
    type: String, 
    required: true ,
  },
  amount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentReference: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    default: 'flutterwave'
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);