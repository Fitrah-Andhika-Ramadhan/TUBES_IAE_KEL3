const db = require('../config/db');
const { paginateQuery, paginatedResponse } = require('../utils/pagination');

// Utility to parse features string into boolean flags
function parseFeatures(features) {
  if (!features) return { has_ac: false, has_wifi: false };
  const normalized = features.toLowerCase();
  return {
    has_ac: normalized.includes('ac'),
    has_wifi: normalized.includes('wifi')
  };
}

const LocalTravel = {
  // Get daily status for a specific local travel option and date
  getDailyStatus: (id, date, callback) => {
    const sql = 'SELECT * FROM LocalTravelDailyStatus WHERE local_travel_id = ? AND date = ?';
    db.query(sql, [id, date], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]);
    });
  },
  // Create a new LocalTravel entry
  create: (data, callback) => {
    const {
      provider, operator_name, type, origin_city, destination_city, origin_kabupaten, destination_kabupaten,
      origin_province, destination_province, route, capacity, features, departure_time, arrival_time, vehicle_model, description
    } = data;
    const sql = `INSERT INTO LocalTravel (provider, operator_name, type, origin_city, destination_city, origin_kabupaten, destination_kabupaten, origin_province, destination_province, route, capacity, features, departure_time, arrival_time, vehicle_model, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [provider, operator_name, type, origin_city, destination_city, origin_kabupaten, destination_kabupaten, origin_province, destination_province, route, capacity, features, departure_time, arrival_time, vehicle_model, description];
    db.query(sql, values, callback);
  },
  // Update an existing LocalTravel entry
  update: (id, data, callback) => {
    const fields = [];
    const values = [];
    [
      'provider', 'operator_name', 'type', 'origin_city', 'destination_city', 'origin_kabupaten', 'destination_kabupaten',
      'origin_province', 'destination_province', 'route', 'capacity', 'features', 'departure_time', 'arrival_time', 'vehicle_model', 'description'
    ].forEach(field => {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    });
    if (fields.length === 0) return callback(null, { affectedRows: 0 });
    const sql = `UPDATE LocalTravel SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);
    db.query(sql, values, callback);
  },

  // Decrease local travel unit availability
  decreaseAvailability: (local_travel_id, date, quantity, callback) => {
    const sql = 'UPDATE LocalTravelDailyStatus SET available_units = available_units - ? WHERE local_travel_id = ? AND date = ? AND available_units >= ?';
    db.query(sql, [quantity, local_travel_id, date, quantity], (err, result) => {
      if (err) {
        return callback(err);
      }
      if (result.affectedRows === 0) {
        return callback(new Error('No availability to decrease or item not found.'));
      }
      callback(null, result);
    });
  },

  // Increase local travel unit availability
  increaseAvailability: (localTravelId, date, quantity, callback) => {
    const sql = 'UPDATE LocalTravelDailyStatus SET available_units = available_units + ? WHERE local_travel_id = ? AND date = ?';
    db.query(sql, [quantity, localTravelId, date], (err, result) => {
      if (err) {
        return callback(err);
      }
      callback(null, result);
    });
  },
  search: (params, callback) => {
    const { origin_city, destination_city, route } = params;
    let sql = `SELECT id, provider, operator_name, type, origin_city, destination_city, origin_kabupaten, destination_kabupaten, origin_province, destination_province, route, capacity, features, departure_time, arrival_time, vehicle_model, description, created_at, updated_at FROM LocalTravel WHERE 1=1`;
    const values = [];
    if (origin_city) { sql += ' AND origin_city = ?'; values.push(origin_city); }
    if (destination_city) { sql += ' AND destination_city = ?'; values.push(destination_city); }
    if (route) { sql += ' AND route LIKE ?'; values.push(`%${route}%`); }
    db.query(sql, values, (err, results) => {
      if (err) return callback(err);
      const enriched = results.map(row => ({ ...row, ...parseFeatures(row.features) }));
      callback(null, enriched);
    });
  },
  
  listAll: (params, callback) => {
    const baseSql = `SELECT id, provider, operator_name, type, origin_city, destination_city, origin_kabupaten, destination_kabupaten, origin_province, destination_province, route, capacity, features, departure_time, arrival_time, vehicle_model, description, created_at, updated_at FROM LocalTravel ORDER BY type, operator_name`;
    const countSql = `SELECT COUNT(*) as items_count FROM LocalTravel`;

    db.query(countSql, (countErr, countResult) => {
      if (countErr) return callback(countErr);

      const totalItems = countResult[0].items_count;
      const { sql, values, pagination } = paginateQuery(baseSql, params);

      db.query(sql, values, (err, results) => {
        if (err) return callback(err);
        const enriched = results.map(row => ({ ...row, ...parseFeatures(row.features) }));
        const response = paginatedResponse(enriched, pagination, totalItems);
        callback(null, response);
      });
    });
  },
  
  filter: (params, callback) => {
    const {
      origin_city, destination_city, origin_province, destination_province,
      origin_kabupaten, destination_kabupaten, type, operator_name, provider,
      route, min_capacity, max_capacity, has_ac, has_wifi,
      min_price, max_price, date, sort_by, sort_order, page, limit
    } = params;

    let values = [];
    let whereConditions = ['1=1'];
    let joins = '';
    const needsDailyStatus = date || min_price || max_price || sort_by === 'price';

    if (needsDailyStatus) {
      joins = 'INNER JOIN LocalTravelDailyStatus ltds ON lt.id = ltds.local_travel_id';
      if (date) {
        whereConditions.push('ltds.date = ?');
        values.push(date);
      }
    }

    if (origin_city) { whereConditions.push('lt.origin_city = ?'); values.push(origin_city); }
    if (destination_city) { whereConditions.push('lt.destination_city = ?'); values.push(destination_city); }
    if (origin_province) { whereConditions.push('lt.origin_province = ?'); values.push(origin_province); }
    if (destination_province) { whereConditions.push('lt.destination_province = ?'); values.push(destination_province); }
    if (origin_kabupaten) { whereConditions.push('lt.origin_kabupaten = ?'); values.push(origin_kabupaten); }
    if (destination_kabupaten) { whereConditions.push('lt.destination_kabupaten = ?'); values.push(destination_kabupaten); }
    if (type) { whereConditions.push('lt.type = ?'); values.push(type); }
    if (operator_name) { whereConditions.push('lt.operator_name LIKE ?'); values.push(`%${operator_name}%`); }
    if (provider) { whereConditions.push('lt.provider LIKE ?'); values.push(`%${provider}%`); }
    if (route) { whereConditions.push('lt.route LIKE ?'); values.push(`%${route}%`); }
    if (min_capacity) { whereConditions.push('lt.capacity >= ?'); values.push(min_capacity); }
    if (max_capacity) { whereConditions.push('lt.capacity <= ?'); values.push(max_capacity); }
    if (has_ac !== undefined) { whereConditions.push(has_ac ? "lt.features LIKE '%AC%'" : "(lt.features NOT LIKE '%AC%' OR lt.features IS NULL)"); }
    if (has_wifi !== undefined) { whereConditions.push(has_wifi ? "lt.features LIKE '%WiFi%'" : "(lt.features NOT LIKE '%WiFi%' OR lt.features IS NULL)"); }
    if (min_price) { whereConditions.push('ltds.price >= ?'); values.push(min_price); }
    if (max_price) { whereConditions.push('ltds.price <= ?'); values.push(max_price); }

    const selectClause = needsDailyStatus
      ? 'SELECT lt.*, ltds.date, ltds.price, ltds.currency, ltds.available_units'
      : 'SELECT lt.*';

    let baseSql = `${selectClause} FROM LocalTravel lt ${joins} WHERE ${whereConditions.join(' AND ')}`;
    let countSql = `SELECT COUNT(DISTINCT lt.id) as items_count FROM LocalTravel lt ${joins} WHERE ${whereConditions.join(' AND ')}`;

    let orderByClause = ' ORDER BY lt.provider, lt.operator_name';
    if (sort_by) {
      const validSortColumns = { 'price': 'ltds.price', 'capacity': 'lt.capacity', 'provider': 'lt.provider' };
      const sortColumn = validSortColumns[sort_by] || 'lt.provider';
      const sortOrder = (sort_order || 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      orderByClause = ` ORDER BY ${sortColumn} ${sortOrder}`;
    }
    baseSql += orderByClause;

    db.query(countSql, values, (countErr, countResult) => {
      if (countErr) return callback(countErr);

      const totalItems = countResult[0].items_count;
      // Manually combine filter values with pagination values to ensure correctness
      const { sql, pagination } = paginateQuery(baseSql, params);
      const allValues = [...values, pagination.limit, pagination.offset];

      db.query(sql, allValues, (err, results) => {
        if (err) return callback(err);
        const enriched = results.map(row => ({ ...row, ...parseFeatures(row.features) }));
        const response = paginatedResponse(enriched, pagination, totalItems);
        callback(null, response);
      });
    });
  },
  getById: (id, callback) => {
    const sql = `SELECT id, provider, operator_name, type, origin_city, destination_city, origin_kabupaten, destination_kabupaten, origin_province, destination_province, route, capacity, features, departure_time, arrival_time, vehicle_model, description, created_at, updated_at FROM LocalTravel WHERE id = ?`;
    db.query(sql, [id], (err, results) => {
      if (err) return callback(err);
      if (!results.length) return callback(null, null);
      const enriched = { ...results[0], ...parseFeatures(results[0].features) };
      callback(null, enriched);
    });
  },


};

module.exports = LocalTravel;
