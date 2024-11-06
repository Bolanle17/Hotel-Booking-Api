const Booking = require('../models/booking');
const Room = require('../models/room');
const User = require('../models/userModel');
const { v4: uuidv4 } = require('uuid');
const { sendBookingConfirmation } = require('../emailService');


exports.createBooking = async (req, res, next) => {
  try {
    const { Name, phone, address, rooms, hotel, email, totalAmount, checkInDate, checkOutDate, guests } = req.body;

    
    if (!totalAmount) {
      return res.json({ message: "Amount is required." });
    }

    const userId = req.user.id;

    
    if (!Array.isArray(rooms)) {
      return res.json({ message: "Rooms must be an array." });
    }

    let user = null;
    if (userId) {
      user = await User.findById(userId);
      if (!user) {
        return res.json({ message: "User not found" });
      }
    }

    if (!userId) {
      return res.json({ message: "User ID is required for booking." });
  }

    
    const roomsWithData = await Promise.all(rooms.map(async (roomBooking) => {
      const room = await Room.findById(roomBooking.roomType);
      if (!room) {
        return res.json({ message: `Room type with id ${roomBooking.roomType} not found` });
      }
      return {
        roomType: room._id,
        numberOfRooms: roomBooking.numberOfRooms,
      };
    }));

    
    const newBooking = new Booking({
      user: userId,  
      bookingId: uuidv4(),
      Name,
      phone,
      address,
      rooms: roomsWithData,
      amount: totalAmount,
      status: userId ? "pending" : "draft",  
      transactionId: uuidv4(),
      checkInDate, 
      checkOutDate,
      email,
      hotel,
      guests,
    });

     await newBooking.save();
     
     res.json({
      message: "Booking created successfully, waiting for payment",
      booking: newBooking
    });
    next();
  } catch (error) {
    console.log(error);
    res.json({ message: "An error occurred while creating the booking." });
  }
};


exports.updateBookingAfterPayment = async (req, res, next) => {
  try {
    const { bookingId, transactionId } = req.body;
    const booking = await Booking.findOne({ bookingId })
      .populate('user')
      .populate('rooms.roomType');
    if (!booking) {
      return res.json({ message: "Booking not found" });
    }
    booking.transactionId = transactionId;
    booking.status = "completed";

    await booking.save();
    await sendBookingConfirmation(booking);
    res.json({ message: "Booking updated and confirmed", booking });
  } catch (error) {
    next();
  }
};

exports.fetchUserBookings = async (req, res) => {
  try {
      const userId = req.user._id || req.query.userId || req.body.userId;

      if (!userId) {
          return res.json({ success: false, message: 'Unauthorized access' });
      }


      const bookings = await Booking.find({ user: userId })
      .populate('rooms.roomType')
      .populate('hotel');  

      res.json({
          success: true,
          bookings
      });
  } catch (error) {
      console.error('Error fetching user bookings:', error);
      res.json({
          success: false,
          message: 'An error occurred while fetching bookings',
          error: error.message
      });
  }
};


exports.transferDraftBooking = async (req, res, next) => {
  try {
    const { bookingId, userId } = req.body;
    
    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.json({ message: "Draft booking not found" });
    }

    if (booking.status !== "draft") {
      return res.json({ message: "This booking is not a draft" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.json({ message: "User not found" });
    }

    booking.user = userId;
    booking.status = "pending";
    await booking.save();

    res.json({ message: "Draft booking transferred successfully", booking });
  } catch (error) {
    next(error);
  }
};