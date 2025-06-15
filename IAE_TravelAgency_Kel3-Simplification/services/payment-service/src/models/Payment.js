const db = require('../config/db');

const Payment = {
  async create(userId, bookingId, amount, payment_method_type) {
    const [results] = await db.query(
      'INSERT INTO Payments (user_id, booking_id, amount, payment_method_type, status) VALUES (?, ?, ?, ?, ?)',
      [userId, bookingId, amount, payment_method_type, 'pending']
    );
    return results;
  },
  async getById(id) {
    const [results] = await db.query('SELECT * FROM Payments WHERE id = ?', [id]);
    return results[0];
  },
  async getUserPayments(userId) {
    const [results] = await db.query('SELECT * FROM Payments WHERE user_id = ?', [userId]);
    return results;
  },
  async updateStatus(id, status) {
    const [results] = await db.query('UPDATE Payments SET status = ? WHERE id = ?', [status, id]);
    return results;
  },
  async getPaymentsByBookingId(bookingId) {
    const [results] = await db.query('SELECT * FROM Payments WHERE booking_id = ?', [bookingId]);
    return results;
  }
};

module.exports = Payment;
