const mongoose = require('mongoose');
const Booking = require('../models/booking');
const Room = require('../models/room');


/**
 * Generates a unique booking ID with a prefix, timestamp, and random number
 * @returns {string} A unique booking ID in the format BK-YYYYMMDD-XXXXXX
 */
const generateBookingId = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    
    return `BK-${year}${month}${day}-${random}`;
  };
  
  /**
   * Validates booking details before processing
   * @param {Object} bookingDetails - The booking details to validate
   * @returns {Object} Object with validation result and optional error message
   */
  const validateBookingDetails = (bookingDetails) => {
    const requiredFields = [
      'Name',
      'email',
      'phone',
      'address',
      'checkInDate',
      'checkOutDate',
      'guests',
      'rooms',
      'hotelId'
    ];
  
    const missingFields = requiredFields.filter(field => !bookingDetails[field]);
    
    if (missingFields.length > 0) {
      return {
        isValid: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      };
    }
  
    if (!Array.isArray(bookingDetails.rooms) || bookingDetails.rooms.length === 0) {
      return {
        isValid: false,
        error: 'At least one room must be selected'
      };
    }
  
    return { isValid: true };
  };
  
  /**
   * Formats booking payload for database storage
   * @param {Object} bookingDetails - Raw booking details from the client
   * @param {string} userId - User ID from authentication
   * @returns {Object} Formatted booking payload
   */
  const formatBookingPayload = (bookingDetails, userId) => {
    const bookingId = generateBookingId();
    
    return {
      bookingId,
      user: userId,
      hotel: bookingDetails.hotelId,
      Name: bookingDetails.Name,
      email: bookingDetails.email,
      phone: bookingDetails.phone,
      address: bookingDetails.address,
      amount: bookingDetails.totalAmount,
      status: 'pending',
      guests: bookingDetails.guests,
      checkInDate: new Date(bookingDetails.checkInDate),
      checkOutDate: new Date(bookingDetails.checkOutDate),
      rooms: bookingDetails.rooms.map(room => ({
        _id: room._id,
        roomType: room.roomType,
        numberOfRooms: room.numberOfRooms || 1,
        roomName: room.roomName,
        hotel: room.hotel || bookingDetails.hotelId
      }))
    };
  };
  
     /**
 * Check if rooms are available for the specified check-in and check-out dates.
 * @param {Array} rooms - List of room IDs to check availability for
 * @param {Date} checkInDate - The check-in date
 * @param {Date} checkOutDate - The check-out date
 * @returns {Promise<boolean>} - Returns true if rooms are available, false otherwise
 */
const checkRoomAvailability = async (rooms, checkInDate, checkOutDate) => {
    const roomIds = rooms.map(room => room._id);
  
    const conflictingBookings = await Booking.find({
      'rooms._id': { $in: roomIds },
      $or: [
        { checkInDate: { $lt: checkOutDate }, checkOutDate: { $gt: checkInDate } }
      ]
    });
  
    if (conflictingBookings.length > 0) {
      return false;  // Room(s) are already booked
    }
    return true;  // Room(s) are available
  };
  
  /**
   * Checks if a specific room is booked during the specified dates
   * @param {Object} room - The room to check availability for
   * @param {Date} checkInDate - The check-in date
   * @param {Date} checkOutDate - The check-out date
   * @returns {Promise<boolean>} - Returns true if the room is booked during the dates, false otherwise
   */
  const isRoomBookedDuringDate = async (room, checkInDate, checkOutDate) => {
    const conflictingBooking = await Booking.findOne({
      'rooms._id': room._id,
      $or: [
        { checkInDate: { $lt: checkOutDate }, checkOutDate: { $gt: checkInDate } }
      ]
    });
  
    return conflictingBooking ? true : false; // Room is booked if a conflicting booking is found
  };
  
  module.exports = {
    generateBookingId,
    validateBookingDetails,
    formatBookingPayload,
    checkRoomAvailability,
    isRoomBookedDuringDate
  };