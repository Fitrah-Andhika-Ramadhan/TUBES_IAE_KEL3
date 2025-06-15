const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Initiate payment
router.post('/', paymentController.initiatePayment);
// Get payment status
router.get('/:id/status', paymentController.getPaymentStatus);
// Get user payment history
router.get('/user/:userId', paymentController.getUserPayments);
// Get payments by booking ID
router.get('/booking/:bookingId', paymentController.getPaymentsByBookingId);

module.exports = router;
