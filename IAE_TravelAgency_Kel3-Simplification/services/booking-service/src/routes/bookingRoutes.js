const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// List all bookings
router.get('/', bookingController.listAllBookings);

// Filter bookings with multiple criteria
router.get('/filter', bookingController.filterBookings);

// Get bookings for a user - must be before /:id route to avoid conflict
router.get('/user/:userId', bookingController.getUserBookings);

// Get booking by ID
router.get('/:id', bookingController.getBookingById);

// Create booking
router.post('/', bookingController.createBooking);
// Cancel booking
router.post('/:id/cancel', bookingController.cancelBooking);

// Modify booking
router.put('/:id', bookingController.modifyBooking);

module.exports = router;
