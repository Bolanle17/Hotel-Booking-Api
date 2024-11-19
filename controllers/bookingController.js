const mongoose = require('mongoose');
const Booking = require('../models/booking');
const Room = require('../models/room');
const User = require('../models/userModel');
const Hotel = require('../models/hotel');
const { v4: uuidv4 } = require('uuid');
const { sendBookingConfirmation } = require('../emailService');
const { generateBookingId, validateBookingDetails, formatBookingPayload, checkRoomAvailability } = require('../utils/bookingUtils');


/**
 * Check if rooms are available for the given check-in and check-out dates
 */
exports.checkRoomAvailability = async (req, res) => {
  try {
    const { rooms, checkInDate, checkOutDate } = req.body;
    
    // Check room availability before proceeding
    const roomsAvailable = await checkRoomAvailability(rooms, new Date(checkInDate), new Date(checkOutDate));
    
    if (!roomsAvailable) {
      return res.json({ success: false, message: 'One or more rooms are already booked during the selected dates' });
    }
    
    return res.json({ success: true, message: 'Rooms are available' });
  } catch (error) {
    console.error('Error checking room availability:', error);
    return res.json({ success: false, message: 'Error checking room availability' });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const {
      Name,
      email,
      rooms,
      totalAmount,
      checkInDate,
      checkOutDate,
      guests,
      phone,
      address,
      hotelId,
      transactionId 
    } = req.body;

    const userId = req.user.id;

    
    if (!Name || !email || !rooms || !userId || !hotelId || !transactionId) { 
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    
    const hotelExists = await Hotel.findById(hotelId);
    if (!hotelExists) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }


    // Check room availability before proceeding
    const roomsAvailable = await checkRoomAvailability(rooms, new Date(checkInDate), new Date(checkOutDate));
    if (!roomsAvailable) {
      return res.status(400).json({ success: false, message: 'The room is already booked for the selected dates' });
    }

    const parsedRooms = typeof rooms === 'string' ? JSON.parse(rooms) : rooms;

    
    const booking = new Booking({
      bookingId: generateBookingId(),
      user: userId,
      hotel: hotelId,
      Name,
      email,
      phone,
      address,
      amount: totalAmount,
      status: 'pending',
      guests,
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      transactionId,
      rooms: parsedRooms.map(room => ({
        _id: room._id,
        roomType: room.roomType,
        numberOfRooms: room.numberOfRooms || 1,
        roomName: room.roomName,
        hotel: room.hotel || hotelId
      }))
    });

    await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Booking created successfully, waiting for payment',
      booking
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating booking'
    });
  }
};


exports.fetchUserBookings = async (req, res) => {
  try {
    const userId = req.user._id || req.query.userId || req.body.userId;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized access' 
      });
    }

    const bookings = await Booking.find({ user: userId })
      .populate('hotel')
      .populate('rooms.roomId')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching bookings',
      error: error.message
    });
  }
};

exports.updateBookingAfterPayment = async (req, res) => {
  try {
    const { bookingId, transactionId } = req.body;
    const booking = await Booking.findOne({ bookingId })
      .populate('user')
      .populate('rooms.roomType');

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.transactionId = transactionId;
    booking.status = "completed";

    await booking.save();
    await sendBookingConfirmation(booking);
    
    return res.status(200).json({ 
      success: true,
      message: "Booking updated and confirmed", 
      booking 
    });
  } catch (error) {
    console.error("Payment update error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Error updating booking after payment" 
    });
  }
};


exports.transferDraftBooking = async (req, res) => {
  try {
    const { bookingId, userId } = req.body;
    
    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({ message: "Draft booking not found" });
    }

    if (booking.status !== "draft") {
      return res.status(400).json({ message: "This booking is not a draft" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    booking.user = userId;
    booking.status = "pending";
    await booking.save();

    return res.status(200).json({ 
      success: true,
      message: "Draft booking transferred successfully", 
      booking 
    });
  } catch (error) {
    console.error("Transfer draft booking error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Error transferring draft booking",
      error: error.message
    });
  }
};