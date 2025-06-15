const Payment = require('../models/Payment');

exports.initiatePayment = async (req, res) => {
  try {
    console.log('[PaymentController] Received payment initiation request body:', req.body);
    const { userId, bookingId, amount, payment_method_type } = req.body;
    if (!userId || !bookingId || !amount || !payment_method_type) {
      console.error('[PaymentController] Missing required fields. Received:', { userId, bookingId, amount, payment_method_type }, 'Original body:', req.body);
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }
    const result = await Payment.create(userId, bookingId, amount, payment_method_type);
    console.log('[PaymentController] Payment created successfully with ID:', result.insertId);
    res.status(201).json({ status: 'success', message: 'Payment initiated successfully', paymentId: result.insertId, paymentStatus: 'pending' });
  } catch (err) {
    console.error('[PaymentController] Error initiating payment:', err);
    res.status(500).json({ status: 'error', message: 'Failed to initiate payment', details: err.message });
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const payment = await Payment.getById(id);
    if (!payment) {
      return res.status(404).json({ status: 'error', message: 'Payment not found' });
    }
    res.json({ status: 'success', paymentId: id, status: payment.status });
  } catch (err) {
    console.error('Error getting payment status:', err);
    res.status(500).json({ status: 'error', message: 'Failed to get payment status', details: err.message });
  }
};

exports.getUserPayments = async (req, res) => {
  try {
    const userId = req.params.userId;
    const payments = await Payment.getUserPayments(userId);
    res.json({ status: 'success', data: payments });
  } catch (err) {
    console.error('Error fetching user payments:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch payments', details: err.message });
  }
};

exports.getPaymentsByBookingId = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    if (!bookingId) {
      return res.status(400).json({ status: 'error', message: 'Missing bookingId parameter' });
    }
    const payments = await Payment.getPaymentsByBookingId(bookingId);
    res.json({ status: 'success', data: payments });
  } catch (err) {
    console.error('Error fetching payments by bookingId:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch payments by bookingId', details: err.message });
  }
};
