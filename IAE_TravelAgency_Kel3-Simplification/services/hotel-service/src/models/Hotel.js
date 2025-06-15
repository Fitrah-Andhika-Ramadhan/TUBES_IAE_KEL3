const db = require('../config/db');
const { paginateQuery, paginatedResponse } = require('../utils/pagination');

const Hotel = {
  // Create a new Hotel entry
  create: (data, callback) => {
    const {
      name, city, province, address, description, star_rating, property_type, facilities
    } = data;
    const sql = `INSERT INTO Hotels (name, city, province, address, description, star_rating, property_type, facilities) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [name, city, province, address, description, star_rating, property_type, facilities];
    db.query(sql, values, callback);
  },
  // Update an existing Hotel entry
  update: (id, data, callback) => {
    const fields = [];
    const values = [];
    [
      'name', 'city', 'province', 'address', 'description', 'star_rating', 'property_type', 'facilities'
    ].forEach(field => {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(data[field]);
      }
    });
    if (fields.length === 0) return callback(null, { affectedRows: 0 });
    const sql = `UPDATE Hotels SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);
    db.query(sql, values, callback);
  },

  // Decrease available rooms for a specific room type on a date
  decreaseAvailability: (hotelId, roomTypeName, date, quantity, callback) => {
    db.query(
      'UPDATE HotelDailyStatus SET available_rooms = available_rooms - ? WHERE hotel_id = ? AND room_type_name = ? AND date = ? AND available_rooms >= ?;',
      [quantity, hotelId, roomTypeName, date, quantity],
      (err, result) => {
        if (err) return callback(err);
        if (result.affectedRows === 0) {
            // Could be due to insufficient rooms or record not found
            // Check if record exists to differentiate
            db.query('SELECT available_rooms FROM HotelDailyStatus WHERE hotel_id = ? AND room_type_name = ? AND date = ?', [hotelId, roomTypeName, date], (selectErr, selectRes) => {
                if (selectErr) return callback(selectErr);
                if (selectRes.length === 0) return callback(new Error('Availability record not found for the given hotel, room type, and date.'));
                if (selectRes[0].available_rooms < quantity) return callback(new Error('Not enough available rooms.'));
                return callback(new Error('Failed to decrease availability for an unknown reason.'));
            });
        } else {
            callback(null, result);
        }
      }
    );
  },
  // Increase available rooms for a specific room type on a date
  increaseAvailability: (hotelId, roomTypeName, date, quantity, callback) => {
    db.query(
      'UPDATE HotelDailyStatus SET available_rooms = available_rooms + ? WHERE hotel_id = ? AND room_type_name = ? AND date = ?;',
      [quantity, hotelId, roomTypeName, date],
      (err, result) => {
        if (err) return callback(err);
        // It's possible the row didn't exist if increasing from 0 after a full depletion and manual adjustment, 
        // or if trying to increase for a non-existent record. For simplicity, we don't create it here.
        // If result.affectedRows === 0 and no error, it means no row matched the criteria.
        callback(null, result);
      }
    );
  },

  search: (params, callback) => {
    const { city, province } = params;
    let sql = `SELECT * FROM Hotels WHERE 1=1`;
    const values = [];
    if (city) { sql += ' AND city = ?'; values.push(city); }
    if (province) { sql += ' AND province = ?'; values.push(province); }
    db.query(sql, values, (err, results) => callback(err, results));
  },
  
  listAll: (params, callback) => {
    // Base query for getting all hotels
    const baseSql = `SELECT * FROM Hotels ORDER BY name`;
    
    // Count total items for pagination metadata
    const countSql = `SELECT COUNT(*) as total FROM Hotels`;
    
    // Apply pagination
    const { sql, values, pagination } = paginateQuery(baseSql, params);
    
    // Execute count query first
    db.query(countSql, [], (countErr, countResults) => {
      if (countErr) {
        console.error("Error in count query (Hotel.listAll):", countErr);
        return callback(countErr, null);
      }
      
      // Safely access totalItems
      if (!countResults || countResults.length === 0 || typeof countResults[0].total === 'undefined') {
        console.error("Unexpected result from count query (Hotel.listAll):", countResults);
        return callback(new Error('Failed to retrieve total count for hotels.'), null);
      }
      const totalItems = countResults[0].total;
      
      // Then execute the paginated query
      db.query(sql, values, (err, results) => {
        if (err) {
          console.error("Error in data query (Hotel.listAll):", err);
          return callback(err, null);
        }
        
        // Format the response with pagination metadata
        const response = paginatedResponse(results, pagination, totalItems);
        callback(null, response);
      });
    });
  },
  
  filter: (params, callback) => {
    const {
      // Hotel specific filters
      name, city, province, stars, property_type, facilities, // 'stars' is used instead of min_star_rating/max_star_rating for simplicity
      // DailyStatus specific filters - 'date' is the key trigger
      date, room_type_name, min_price, max_price,
      // General query control
      sort_by, sort_order, page = 1, limit = 10 // Default pagination
    } = params;

    let baseSql;
    const values = [];
    const filters = [];

    // Add Hotel specific filters first, as they apply whether joining or not
    // These filters will be prefixed with 'h.' in the SQL
    if (name) { filters.push('h.name LIKE ?'); values.push(`%${name}%`); }
    if (city) { filters.push('h.city LIKE ?'); values.push(`%${city}%`); }
    if (province) { filters.push('h.province LIKE ?'); values.push(`%${province}%`); }
    if (stars) { filters.push('h.star_rating = ?'); values.push(stars); }
    // Assuming 'property_type' and 'facilities' columns exist in the 'Hotels' table
    if (property_type) { filters.push('h.property_type LIKE ?'); values.push(`%${property_type}%`); }
    if (facilities) { filters.push('h.facilities LIKE ?'); values.push(`%${facilities}%`); }

    if (date) { // If a date is provided, we join with HotelDailyStatus
      baseSql = `
        SELECT DISTINCT h.id, h.name, h.city, h.province, h.address, h.description, h.stars, h.phone, h.email, h.property_type, h.facilities
        FROM Hotels h
        JOIN HotelDailyStatus hds ON h.id = hds.hotel_id
        WHERE 1=1 AND hds.available_rooms > 0 
      `; // Base condition for join: rooms must be available
      
      // Add date filter for HotelDailyStatus
      filters.push('hds.date = ?');
      values.push(date);

      // Add other DailyStatus specific filters
      if (room_type_name) {
        filters.push('hds.room_type_name LIKE ?');
        values.push(`%${room_type_name}%`);
      }
      if (min_price !== undefined) {
        filters.push('hds.price >= ?');
        values.push(min_price);
      }
      if (max_price !== undefined) {
        filters.push('hds.price <= ?');
        values.push(max_price);
      }
    } else { // No date provided, only filter on Hotels table
      baseSql = `
        SELECT h.id, h.name, h.city, h.province, h.address, h.description, h.star_rating, h.property_type, h.facilities
        FROM Hotels h
        WHERE 1=1
      `;
      // Hotel-specific filters are already added to `filters` and `values`.
      // DailyStatus filters (room_type_name, min_price, max_price) are ignored if no date is provided.
    }

    let whereClause = '';
    if (filters.length > 0) {
      whereClause = ' AND ' + filters.join(' AND ');
    }
    let sql = baseSql + whereClause;

    // Count query construction
    let countSql;
    if (date) { // Joined with HotelDailyStatus
      countSql = `
        SELECT COUNT(DISTINCT h.id) as total
        FROM Hotels h
        JOIN HotelDailyStatus hds ON h.id = hds.hotel_id
        WHERE 1=1 AND hds.available_rooms > 0 ${whereClause}
      `;
    } else { // Only Hotels table
      countSql = `
        SELECT COUNT(h.id) as total
        FROM Hotels h
        WHERE 1=1 ${whereClause}
      `;
    }
    const whereClauseValues = [...values]; // Values for the WHERE clause, used by both count and main query (before pagination)

    // Sorting
    const validSortColumnsHotel = ['name', 'stars', 'city', 'province'];
    const validSortColumnsDailyStatus = ['price'];
    let sortColumn = 'h.name'; // Default sort
    let effectiveSortBy = sort_by || 'name';

    if (validSortColumnsHotel.includes(effectiveSortBy)) {
      sortColumn = `h.${effectiveSortBy}`;
    } else if (date && validSortColumnsDailyStatus.includes(effectiveSortBy)) { // Sort by price only if date is provided (implies join)
      sortColumn = `hds.${effectiveSortBy}`;
    } else {
      // If sort_by is not recognized or not applicable (e.g. price without date), default to sorting by name
      effectiveSortBy = 'name'; 
      sortColumn = 'h.name';
    }
    const order = sort_order && sort_order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    sql += ` ORDER BY ${sortColumn} ${order}`;

    // Pagination
    const { sql: paginatedSql, values: paginationOnlyValues, pagination } 
      = paginateQuery(sql, { page, limit });
    const allQueryValues = [...whereClauseValues, ...paginationOnlyValues];

    // Execute count query
    db.query(countSql, whereClauseValues, (countErr, countResults) => {
      if (countErr) {
        console.error("Error in count query:", countErr, "SQL:", countSql, "Values:", whereClauseValues);
        return callback(countErr);
      }
      if (!countResults || countResults.length === 0) {
        // This case should ideally not happen if the SQL is valid and DB is up, but good to check.
        console.error("No results from count query. SQL:", countSql, "Values:", whereClauseValues);
        return callback(new Error("Failed to get total count for hotels."));
      }
      const totalItems = countResults[0].total;

      // Execute paginated data query
      db.query(paginatedSql, allQueryValues, (err, results) => {
        if (err) {
          console.error("Error in data query:", err, "SQL:", paginatedSql, "Values:", allQueryValues);
          return callback(err);
        }
        const response = paginatedResponse(results, pagination, totalItems);
        callback(null, response);
      });
    });
  },
  getById: (id, callback) => {
    db.query('SELECT * FROM Hotels WHERE id = ?', [id], (err, results) => callback(err, results[0]));
  },
  // getRoomTypes method removed as RoomTypes table is obsolete.

  getDailyStatus: (hotelId, date, callback) => {
    const sql = 'SELECT room_type_name, date, available_rooms, price, currency FROM HotelDailyStatus WHERE hotel_id = ? AND date = ?';
    db.query(sql, [hotelId, date], callback);
  }
};

module.exports = Hotel;
