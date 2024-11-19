const nodemailer = require('nodemailer');
require('dotenv').config();

const createTransporter = async () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

exports.sendBookingConfirmation = async (booking) => {
  try {
    console.log('Attempting to send email for booking:', booking);

    
    const formatDate = (date) => {
      const d = new Date(date);
      return d.toLocaleString('en-US', {
        day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true,
        timeZone: 'Africa/Lagos'
      });
    };

    
    const checkInDate = formatDate(booking.checkInDate);
    const checkOutDate = formatDate(new Date(booking.checkOutDate).setHours(12, 0, 0, 0));

    const rooms = booking.rooms;  

    
    const roomDetails = rooms.map(room => {
      const roomType = room.roomType || 'N/A';  
      const numberOfRooms = room.numberOfRooms || 1;  
      return `
        <li style="background-color: #ffffff; padding: 10px; border-radius: 4px; margin-bottom: 10px;">
          <p style="color: #4a5568; font-size: 14px; margin: 5px 0;"><strong>Room Type:</strong> ${roomType}</p>
          <p style="color: #4a5568; font-size: 14px; margin: 5px 0;"><strong>Number of Rooms:</strong> ${numberOfRooms}</p>
        </li>
      `;
    }).join('');

    // Mail options setup
    const mailOptions = {
      from: '"MOAHOTELS" <opeyemi6280@gmail.com>',  
      to: booking.email, 
      subject: 'Booking Confirmation',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0f0f0;">
        <h1 style="color: #4a5568; text-align: center; font-size: 24px; margin-bottom: 20px;">Booking Confirmation</h1>
        <p style="color: #2d3748; font-size: 16px;">Dear ${booking.Name},</p>
        <p style="color: #2d3748; font-size: 16px;">Your booking has been confirmed. Here are the details:</p>
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="color: #4a5568; font-size: 14px; margin: 5px 0;"><strong>Booking ID:</strong> ${booking.bookingId}</p>
          <p style="color: #4a5568; font-size: 14px; margin: 5px 0;"><strong>Amount:</strong> ₦${booking.amount.toFixed(2)}</p>
          <p style="color: #4a5568; font-size: 14px; margin: 5px 0;"><strong>Phone:</strong> ${booking.phone}</p>
          <p style="color: #4a5568; font-size: 14px; margin: 5px 0;"><strong>Address:</strong> ${booking.address}</p>
          <p style="color: #4a5568; font-size: 14px; margin: 5px 0;"><strong>Status:</strong> ${booking.status}</p>
          <p style="color: #4a5568; font-size: 14px; margin: 5px 0;"><strong>Transaction ID:</strong> ${booking.transactionId}</p>
          <p style="color: #4a5568; font-size: 14px; margin: 5px 0;"><strong>Check in:</strong> ${checkInDate}</p>
          <p style="color: #4a5568; font-size: 14px; margin: 5px 0;"><strong>Check out:</strong> ${checkOutDate}</p>
          <p style="color: #4a5568; font-size: 14px; margin: 5px 0;"><strong>Number of Guests:</strong> ${booking.guests}</p>
        </div>
        <h2 style="color: #4a5568; font-size: 18px; margin-bottom: 10px;">Booked Rooms:</h2>
        <ul style="list-style-type: none; padding: 0;">
          ${roomDetails}
        </ul>
        <p style="color: #2d3748; font-size: 16px; text-align: center; margin-top: 20px;">Thank you for choosing MOAHOTELS!</p>
      </div>
      `
    };

  
    const transporter = await createTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log('Booking confirmation email sent:', info);
    return info;

  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
