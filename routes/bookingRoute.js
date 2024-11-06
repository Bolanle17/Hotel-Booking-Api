const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { auth } = require('../middleware/auth');


router.post('/',auth, bookingController.createBooking);


router.post('/update-after-payment', auth, bookingController.updateBookingAfterPayment);



router.get('/bookings',auth, bookingController.fetchUserBookings);

module.exports = router;