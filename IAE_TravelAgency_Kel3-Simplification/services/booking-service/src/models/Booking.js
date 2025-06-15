const util = require('util');
const db = require('../config/db');
const { paginateQuery, paginatedResponse } = require('../utils/pagination');

const query = util.promisify(db.query).bind(db);

const Booking = {
  async getById(id) {
    const results = await query('SELECT id, user_id, booking_code, total_amount, currency, payment_status, special_requests, status, created_at, updated_at FROM Bookings WHERE id = ?', [id]);
    return results[0];
  },

  async getUserBookings(userId) {
    return query('SELECT id, user_id, booking_code, total_amount, currency, payment_status, special_requests, status, created_at, updated_at FROM Bookings WHERE user_id = ?', [userId]);
  },

  async create(bookingData) {
    // Generate a unique booking code
    const booking_code = `BOOK-${Date.now()}`.slice(0, 20);

    const {
      user_id,
      type,
      ref_id,
      travel_date,
      quantity,
      unit_price,
      details,
      status,
      total_amount,
      currency,
      payment_status,
      special_requests
    } = bookingData;

    const sql = `
      INSERT INTO Bookings 
      (booking_code, user_id, type, ref_id, travel_date, quantity, unit_price, details, status, total_amount, currency, payment_status, special_requests, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const values = [booking_code, user_id, type, ref_id, travel_date, quantity, unit_price, details, status, total_amount, currency, payment_status, special_requests];
    
    return query(sql, values);
  },
  
  async listAll(params) {
    const baseSql = `SELECT * FROM Bookings ORDER BY created_at DESC`;
    const countSql = `SELECT COUNT(*) as total FROM Bookings`;

    const countResults = await query(countSql);
    const totalItems = countResults[0].total;

    const { sql, values, pagination } = paginateQuery(baseSql, params);
    const results = await query(sql, values);

    return paginatedResponse(results, pagination, totalItems);
  },
  
  async filter(params) {
    const { 
      user_id, booking_code, status, payment_status, item_type,
      min_total, max_total, start_date, end_date, sort_by, sort_order,
      origin_city, destination_city, origin_province, destination_province,
      service_class, provider, travel_date_start, travel_date_end,
      page, limit 
    } = params;

    let whereClauses = [];
    let values = [];
    let joins = 'LEFT JOIN BookingItems bi ON b.id = bi.booking_id';

    if (user_id) { whereClauses.push('b.user_id = ?'); values.push(user_id); }
    if (booking_code) { whereClauses.push('b.booking_code LIKE ?'); values.push(`%${booking_code}%`); }
    if (status) { whereClauses.push('b.status = ?'); values.push(status); }
    if (payment_status) { whereClauses.push('b.payment_status = ?'); values.push(payment_status); }
    if (item_type) { whereClauses.push('bi.type = ?'); values.push(item_type); }
    if (min_total) { whereClauses.push('b.total_amount >= ?'); values.push(min_total); }
    if (max_total) { whereClauses.push('b.total_amount <= ?'); values.push(max_total); }
    if (start_date) { whereClauses.push('DATE(b.created_at) >= ?'); values.push(start_date); }
    if (end_date) { whereClauses.push('DATE(b.created_at) <= ?'); values.push(end_date); }
    if (origin_city) { whereClauses.push('bi.origin_city = ?'); values.push(origin_city); }
    if (destination_city) { whereClauses.push('bi.destination_city = ?'); values.push(destination_city); }
    if (origin_province) { whereClauses.push('bi.origin_province = ?'); values.push(origin_province); }
    if (destination_province) { whereClauses.push('bi.destination_province = ?'); values.push(destination_province); }
    if (service_class) { whereClauses.push('bi.service_class = ?'); values.push(service_class); }
    if (provider) { whereClauses.push('bi.provider LIKE ?'); values.push(`%${provider}%`); }
    if (travel_date_start) { whereClauses.push('bi.travel_date >= ?'); values.push(travel_date_start); }
    if (travel_date_end) { whereClauses.push('bi.travel_date <= ?'); values.push(travel_date_end); }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(DISTINCT b.id) as total FROM Bookings b ${joins} ${whereSql}`;
    const countResults = await query(countSql, values);
    const totalItems = countResults[0].total;

    let orderBySql = 'ORDER BY b.created_at DESC';
    if (sort_by) {
      const validSortColumns = ['created_at', 'total_amount', 'status', 'payment_status'];
      const sortColumn = validSortColumns.includes(sort_by) ? `b.${sort_by}` : 'b.created_at';
      const order = sort_order && sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      orderBySql = `ORDER BY ${sortColumn} ${order}`;
    }

    const baseSql = `
      SELECT b.*, bi.type as item_type, bi.origin_city, bi.destination_city, 
      bi.origin_province, bi.destination_province, bi.service_class, bi.provider, bi.travel_date
      FROM Bookings b
      ${joins}
      ${whereSql}
      GROUP BY b.id
      ${orderBySql}
    `;

    const { sql: paginatedSql, values: paginatedValues, pagination } = paginateQuery(baseSql, { page, limit }, values);
    const results = await query(paginatedSql, paginatedValues);

    return paginatedResponse(results, pagination, totalItems);
  },

  async cancel(bookingId) {
    return query('UPDATE Bookings SET status = ?, updated_at = NOW() WHERE id = ?', ['cancelled', bookingId]);
  },

  async update(bookingId, dataToUpdate) {
    const fields = [];
    const values = [];

    // Dynamically build the SET part of the query
    for (const [key, value] of Object.entries(dataToUpdate)) {
      if (value !== undefined) { // Only include fields that are actually being updated
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      // No fields to update, perhaps return an indication or throw an error
      return { affectedRows: 0, message: 'No fields to update' };
    }

    // Add updated_at timestamp
    fields.push('updated_at = NOW()');
    values.push(bookingId); // Add bookingId for the WHERE clause

    const sql = `UPDATE Bookings SET ${fields.join(', ')} WHERE id = ?`;
    return query(sql, values);
  }
};

module.exports = Booking;
