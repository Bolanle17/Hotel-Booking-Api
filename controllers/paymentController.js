const mongoose = require('mongoose');
const { v4: uuidv4 } = require("uuid");
const Booking = require("../models/booking");
const User = require("../models/userModel");
const { sendBookingConfirmation } = require("../emailService");
const Payment = require("../models/payment");
const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;


exports.initiatePayment = async (req, res) => {
  try {
    
    const token = req.header('auth-token');
    if (!token) {
      return res.json({
        message: "Access denied. No token provided.",
      });
    }

    
    console.log('Received token:', token);
    console.log('Request body:', req.body);

    const { bookingId, userId, amount, currency, Name, phone, address, guests, checkInDate, checkOutDate, rooms, email } = req.body;
    if (!bookingId || !userId) {
      return res.json({
        message: "Booking ID and User ID are required for payment.",
      });
    }


    
    const user = await User.findById(userId);
    if (!user) {
      return res.json({
        message: "User not found.",
      });
    }

    console.log('Found user:', user.email);
    console.log('Payment details:', { amount, currency, Name, phone, address, guests, checkInDate, checkOutDate });

    
    const payment = new Payment({
      userId,
      bookingId,
      amount,
      paymentStatus: 'pending',
      paymentReference: `booking-${bookingId}`
    });
    const savedPayment = await payment.save();

    
    const paymentData = {
      tx_ref: savedPayment.paymentReference,
      amount,
      currency: currency || 'NGN',
      redirect_url: "https://hotel-booking-frontend-seso.onrender.com/thankyou",
      customer: {
        email,
        phonenumber: phone,
        name: Name
      },
      meta: {
        Name,
        phone,
        address,
        guests,
        booking_id: bookingId,
        checkInDate,
        checkOutDate,
        rooms: JSON.stringify(rooms)
      },
      customizations: {
        title: "Hotel Booking",
        description: "Payment for booked room"
      }
    };

    console.log("Sending to Flutterwave:", paymentData);

    
    const response = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FLW_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(paymentData)
    });

    const data = await response.json();
    console.log('Flutterwave API response:', data);

    if (data.status === "success") {
      console.log("Payment initiated successfully. Redirect URL:", data.data.link);
      res.json({ 
        status: "success", 
        data: { link: data.data.link }, 
        bookingId 
      });
    } else {
      console.error("Payment Initiation Failed. Flutterwave response:", data);
      res.json({ 
        msg: "Payment Initiation Failed", 
        error: data 
      });
    }
  } catch (error) {
    console.error("Server error during payment initiation:", error);
    res.json({ 
      msg: "Server error during payment initiation", 
      error: error.message 
    });
  }
};


  exports.verifyPayment = async (req, res) => {
    try {
      
      const { transaction_id, tx_ref, userId } = req.body;
  
      console.log('Verifying payment:', { transaction_id, tx_ref, userId });

     
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.json({
          msg: 'Invalid user ID format',
          error: 'User ID must be a valid MongoDB ObjectId'
        });
      }
  
      if (!transaction_id) {
        return res.json({ 
          msg: "Transaction ID is required" 
        });
      }
  
      
      const response = await fetch(
        `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${FLW_SECRET_KEY}`,
            "Content-Type": "application/json"
          },
        }
      );
  
      const data = await response.json();
      console.log("Flutterwave verification response:", data);
  
      if (data.status === "success" && data.data.status === "successful") {
        
        const existingBooking = await Booking.findOne({ transactionId: transaction_id });
        if (existingBooking) {
          return res.json({ 
            msg: "Payment already verified", 
            booking: existingBooking 
          });
        }
  
        
        const flwData = data.data;
        const metaData = flwData.meta;
  
        
        const booking = new Booking({
          bookingId: metaData.booking_id,
          user: userId, 
          Name: flwData.customer.name,
          email: flwData.customer.email,
          phone: metaData.phone || flwData.customer.phone_number,
          address: metaData.address,
          amount: flwData.amount,
          status: "completed",
          transactionId: transaction_id,
          guests: parseInt(metaData.guests),
          checkInDate: new Date(metaData.checkInDate),
          checkOutDate: new Date(metaData.checkOutDate),
          rooms: JSON.parse(metaData.rooms)
        });
  
        
        try {
          await booking.validate();
        } catch (validationError) {
          console.error('Booking validation error:', validationError);
          return res.json({
            msg: 'Invalid booking data',
            error: validationError.message
          });
        }

        await booking.save();
  
        
        await Payment.findOneAndUpdate(
          { paymentReference: tx_ref },
          { paymentStatus: 'completed' }
        );
  
        
        try {
          const user = await User.findById(userId);
          if (!user) {
            console.error('User not found:', userId);
          } else {
            const bookingWithUser = { ...booking.toObject(), user };
            await sendBookingConfirmation(bookingWithUser);
            console.log('Email sent successfully');
          }
        } catch (emailError) {
          console.error('Error sending email:', emailError);
          
        }
  
        return res.json({ 
          msg: "Payment Successful", 
          booking 
        });
      } else {
        return res.json({ 
          msg: "Payment verification failed", 
          details: data 
        });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      return res.json({ 
        msg: "Server error during payment verification", 
        error: error.message 
      });
    }
  };