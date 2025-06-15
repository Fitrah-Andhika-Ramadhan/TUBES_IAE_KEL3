const util = require('util');
const db = require('../config/db');
const { paginateQuery, paginatedResponse } = require('../utils/pagination');

// Promisify db.query for async/await support
const query = util.promisify(db.query).bind(db);

const User = {
  async getById(id) {
    const results = await query('SELECT * FROM Users WHERE id = ?', [id]);
    return results[0];
  },

  async getByEmail(email) {
    const results = await query('SELECT * FROM Users WHERE email = ?', [email]);
    return results[0];
  },
  
  async listAll(params) {
    const baseSql = `SELECT id, email, full_name, phone_number, birth_date, no_nik, address, kelurahan, kecamatan, kabupaten_kota, province, postal_code, created_at FROM Users ORDER BY full_name`;
    const countSql = `SELECT COUNT(*) as total FROM Users`;
    
    const countResults = await query(countSql);
    const totalItems = countResults[0].total;
    
    const { sql, values, pagination } = paginateQuery(baseSql, params);
    
    const results = await query(sql, values);
    
    return paginatedResponse(results, pagination, totalItems);
  },
  
  async filter(params) {
    const { 
      email, full_name, phone_number, min_age, max_age, start_date, end_date, 
      kabupaten_kota, province, postal_code, sort_by, sort_order, page, limit
    } = params;

    let whereClauses = [];
    let values = [];

    if (email) { whereClauses.push('email LIKE ?'); values.push(`%${email}%`); }
    if (full_name) { whereClauses.push('full_name LIKE ?'); values.push(`%${full_name}%`); }
    if (phone_number) { whereClauses.push('phone_number LIKE ?'); values.push(`%${phone_number}%`); }
    if (kabupaten_kota) { whereClauses.push('kabupaten_kota LIKE ?'); values.push(`%${kabupaten_kota}%`); }
    if (province) { whereClauses.push('province LIKE ?'); values.push(`%${province}%`); }
    if (postal_code) { whereClauses.push('postal_code LIKE ?'); values.push(`%${postal_code}%`); }
    if (min_age) { whereClauses.push('birth_date <= DATE_SUB(CURDATE(), INTERVAL ? YEAR)'); values.push(min_age); }
    if (max_age) { whereClauses.push('birth_date >= DATE_SUB(CURDATE(), INTERVAL ? YEAR)'); values.push(max_age); }
    if (start_date) { whereClauses.push('DATE(created_at) >= ?'); values.push(start_date); }
    if (end_date) { whereClauses.push('DATE(created_at) <= ?'); values.push(end_date); }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Count total items with the same filters
    const countSql = `SELECT COUNT(*) as total FROM Users ${whereSql}`;
    const countResults = await query(countSql, values);
    const totalItems = countResults[0].total;

    // Prepare main query with sorting
    let orderBySql = 'ORDER BY full_name ASC';
    if (sort_by) {
      const validSortColumns = ['full_name', 'email', 'created_at', 'birth_date', 'province', 'kabupaten_kota'];
      const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'full_name';
      const order = sort_order && sort_order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      orderBySql = `ORDER BY ${sortColumn} ${order}`;
    }

    const baseSql = `
      SELECT id, email, full_name, phone_number, birth_date, no_nik, address, kelurahan, kecamatan, kabupaten_kota, province, postal_code, created_at 
      FROM Users
      ${whereSql}
      ${orderBySql}
    `;

    // Apply pagination to the final query
    const { sql: paginatedSql, values: paginatedValues, pagination } = paginateQuery(baseSql, { page, limit }, values);

    const results = await query(paginatedSql, paginatedValues);
    
    return paginatedResponse(results, pagination, totalItems);
  },

  async create(user) {
    const { 
      email, password, full_name, phone_number, birth_date, no_nik,
      address, kelurahan, kecamatan, kabupaten_kota, province, postal_code 
    } = user;
    
    const sql = 'INSERT INTO Users (email, password, full_name, phone_number, birth_date, no_nik, address, kelurahan, kecamatan, kabupaten_kota, province, postal_code, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())';
    const values = [email, password, full_name, phone_number, birth_date, no_nik, address, kelurahan, kecamatan, kabupaten_kota, province, postal_code];
    
    const results = await query(sql, values);
    return results;
  },

  async update(id, user) {
    const { 
      full_name, phone_number, birth_date, no_nik,
      address, kelurahan, kecamatan, kabupaten_kota, province, postal_code 
    } = user;
    
    const sql = 'UPDATE Users SET full_name=?, phone_number=?, birth_date=?, no_nik=?, address=?, kelurahan=?, kecamatan=?, kabupaten_kota=?, province=?, postal_code=? WHERE id=?';
    const values = [full_name, phone_number, birth_date, no_nik, address, kelurahan, kecamatan, kabupaten_kota, province, postal_code, id];

    const results = await query(sql, values);
    return results;
  },

  async delete(id) {
    const results = await query('DELETE FROM Users WHERE id=?', [id]);
    return results;
  }
};

module.exports = User;
