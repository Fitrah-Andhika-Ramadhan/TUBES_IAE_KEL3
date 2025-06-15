const db = require('../config/db');
const { paginateQuery, paginatedResponse } = require('../utils/pagination');

const Train = {
  // Decrease train seat availability
  decreaseAvailability: (trainId, date, quantity, callback) => {
    db.query(
      'UPDATE TrainAvailability SET available_seats = available_seats - ? WHERE train_id = ? AND date = ? AND available_seats >= ?;',
      [quantity, trainId, date, quantity],
      (err, result) => {
        if (err) return callback(err);
        callback(null, result);
      }
    );
  },
  // Increase train seat availability
  increaseAvailability: (trainId, date, quantity, callback) => {
    db.query(
      'UPDATE TrainAvailability SET available_seats = available_seats + ? WHERE train_id = ? AND date = ?;',
      [quantity, trainId, date],
      (err, result) => {
        if (err) return callback(err);
        callback(null, result);
      }
    );
  },
  search: (params, callback) => {
    const { origin_station_code, destination_station_code, origin_city, destination_city, origin_province, destination_province } = params;
    let sql = `SELECT * FROM Trains WHERE 1=1`;
    const values = [];
    if (origin_station_code) { sql += ' AND origin_station_code = ?'; values.push(origin_station_code); }
    if (destination_station_code) { sql += ' AND destination_station_code = ?'; values.push(destination_station_code); }
    if (origin_city) { sql += ' AND origin_city = ?'; values.push(origin_city); }
    if (destination_city) { sql += ' AND destination_city = ?'; values.push(destination_city); }
    if (origin_province) { sql += ' AND origin_province = ?'; values.push(origin_province); }
    if (destination_province) { sql += ' AND destination_province = ?'; values.push(destination_province); }
    db.query(sql, values, (err, results) => callback(err, results));
  },
  
  listAll: (params, callback) => {
    // Base query for getting all trains
    const baseSql = `SELECT * FROM Trains ORDER BY departure_time`;
    
    // Count total items for pagination metadata
    const countSql = `SELECT COUNT(*) as total FROM Trains`;
    
    // Apply pagination
    const { sql, values, pagination } = paginateQuery(baseSql, params);
    
    // Execute count query first
    db.query(countSql, [], (countErr, countResults) => {
      if (countErr) return callback(countErr, null);
      
      const totalItems = countResults[0].total;
      
      // Then execute the paginated query
      db.query(sql, values, (err, results) => {
        if (err) return callback(err, null);
        
        // Format the response with pagination metadata
        const response = paginatedResponse(results, pagination, totalItems);
        callback(null, response);
      });
    });
  },
  
  filter: (params, callback) => {
    const { 
      origin_station_code, destination_station_code, origin_city, destination_city,
      origin_province, destination_province, train_class, subclass, train_type,
      operator, min_duration, max_duration, price_category,
      min_price, max_price, departure_date, sort_by, sort_order,
      page, limit
    } = params;
    
    // Set sensible pagination defaults if not provided
    const safeLimit = limit && Number.isInteger(limit) && limit > 0 ? limit : 10;
    const safePage = page && Number.isInteger(page) && page > 0 ? page : 1;

    // Dynamic JOIN based on departure_date
    let baseSql;
    let joinParams = [];
    if (departure_date) {
      baseSql = `
        SELECT
            t.id,
            t.name,
            t.operator,
            t.origin_station_code,
            t.origin_station_name,
            t.origin_city,
            t.origin_province,
            t.destination_station_code,
            t.destination_station_name,
            t.destination_city,
            t.destination_province,
            t.departure_time,
            t.arrival_time,
            t.train_type,
            t.description,
            t.facilities,
            t.created_at,
            t.updated_at,
            -- Aliases required by GraphQL schema or resolvers
            t.train_code AS train_number, 
            t.travel_duration AS duration,
            -- Fields from TrainDailyStatus for price/availability context
            tds.price, 
            tds.currency,
            tds.available_seats AS seats_available
        FROM Trains t
        LEFT JOIN TrainDailyStatus tds ON t.id = tds.train_id AND tds.date = ?
        WHERE 1=1
      `;
      joinParams = [departure_date];
    } else {
      baseSql = `
        SELECT
            t.id,
            t.name,
            t.operator,
            t.origin_station_code,
            t.origin_station_name,
            t.origin_city,
            t.origin_province,
            t.destination_station_code,
            t.destination_station_name,
            t.destination_city,
            t.destination_province,
            t.departure_time,
            t.arrival_time,
            t.train_type,
            t.description,
            t.facilities,
            t.created_at,
            t.updated_at,
            -- Aliases required by GraphQL schema or resolvers
            t.train_code AS train_number, 
            t.travel_duration AS duration,
            -- Fields from TrainDailyStatus for price/availability context
            tds.price, 
            tds.currency,
            tds.available_seats AS seats_available
        FROM Trains t
        LEFT JOIN TrainDailyStatus tds ON t.id = tds.train_id /* No date condition in JOIN if not provided by filter */
        WHERE 1=1
      `;
      joinParams = [];
    }
    let values = [];
    // Indonesian-specific filters
    if (origin_station_code) { baseSql += ' AND t.origin_station_code = ?'; values.push(origin_station_code); }
    if (destination_station_code) { baseSql += ' AND t.destination_station_code = ?'; values.push(destination_station_code); }
    if (origin_city) { baseSql += ' AND t.origin_city = ?'; values.push(origin_city); }
    if (destination_city) { baseSql += ' AND t.destination_city = ?'; values.push(destination_city); }
    if (origin_province) { baseSql += ' AND t.origin_province = ?'; values.push(origin_province); }
    if (destination_province) { baseSql += ' AND t.destination_province = ?'; values.push(destination_province); }
    if (subclass) { baseSql += ' AND t.subclass = ?'; values.push(subclass); }
    if (train_type) { baseSql += ' AND t.train_type = ?'; values.push(train_type); }
    // if (price_category) { baseSql += ' AND tp.price_category = ?'; values.push(price_category); } // price_category removed from TrainDailyStatus
    if (train_class) { baseSql += ' AND t.train_class = ?'; values.push(train_class); }
    if (operator) { baseSql += ' AND t.operator = ?'; values.push(operator); }
    if (min_duration) { baseSql += ' AND t.travel_duration >= ?'; values.push(min_duration); }
    if (max_duration) { baseSql += ' AND t.travel_duration <= ?'; values.push(max_duration); }
    if (min_price) { baseSql += ' AND tds.price >= ?'; values.push(min_price); }
    if (max_price) { baseSql += ' AND tds.price <= ?'; values.push(max_price); }
    // if (departure_date) { baseSql += ' AND tds.date = ?'; values.push(departure_date); } // Handled by JOIN condition when departure_date is present
    
    // Add sorting
    if (sort_by && sort_order) {
      const validSortColumns = ['departure_time', 'arrival_time', 'travel_duration', 'price', 'train_class', 'train_type'];
      const validSortOrders = ['ASC', 'DESC'];
      
      if (validSortColumns.includes(sort_by) && validSortOrders.includes(sort_order.toUpperCase())) {
        const sortColumn = sort_by === 'price' ? 'tds.price' : `t.${sort_by}`;
        baseSql += ` ORDER BY ${sortColumn} ${sort_order.toUpperCase()}`;
      } else {
        // Default sorting
        baseSql += ' ORDER BY t.departure_time ASC';
      }
    } else {
      // Default sorting
      baseSql += ' ORDER BY t.departure_time ASC';
    }
    
    // Count total items for pagination metadata
    // We need to use a modified version of the query for counting
    let countSqlBase = `
      SELECT COUNT(DISTINCT t.id) as total /* Use COUNT(DISTINCT t.id) if TrainDailyStatus can cause duplicates for a single train */
      FROM Trains t
    `; 
    let countSqlJoins = '';
    let countSqlWhere = ' WHERE 1=1';

    // Add join for TrainDailyStatus. If departure_date is present, join on that date.
    // Otherwise, join without a date condition (which might count trains if they have *any* daily status entry, or none if strictly filtering on price later)
    // This logic depends on whether we want to count trains that *could* match price criteria on *any* day, or only on a *specific* day.
    // For now, if departure_date is given, we join on it. Otherwise, we join without a date to allow for price filtering across any date.
    if (departure_date || min_price || max_price) { // Only join if we need to filter by date or price
        countSqlJoins += ` LEFT JOIN TrainDailyStatus tds ON t.id = tds.train_id`;
        if (departure_date) {
            countSqlJoins += ' AND tds.date = ?'; 
            // Note: 'values' for countSql will need departure_date if this path is taken.
        }
    }

    
    // Add the same WHERE conditions to the count query
    if (origin_station_code) { countSqlWhere += ' AND t.origin_station_code = ?'; }
    if (destination_station_code) { countSqlWhere += ' AND t.destination_station_code = ?'; }
    if (origin_city) { countSqlWhere += ' AND t.origin_city = ?'; }
    if (destination_city) { countSqlWhere += ' AND t.destination_city = ?'; }
    if (origin_province) { countSqlWhere += ' AND t.origin_province = ?'; }
    if (destination_province) { countSqlWhere += ' AND t.destination_province = ?'; }
    if (subclass) { countSqlWhere += ' AND t.subclass = ?'; }
    if (train_type) { countSqlWhere += ' AND t.train_type = ?'; }
    // if (price_category) { countSqlWhere += ' AND tds.price_category = ?'; } // price_category removed
    if (train_class) { countSqlWhere += ' AND t.train_class = ?'; }
    if (operator) { countSqlWhere += ' AND t.operator = ?'; }
    if (min_duration) { countSqlWhere += ' AND t.travel_duration >= ?'; } // Corrected from t.duration
    if (max_duration) { countSqlWhere += ' AND t.travel_duration <= ?'; } // Corrected from t.duration
    if (min_price) { countSqlWhere += ' AND tds.price >= ?'; }
    if (max_price) { countSqlWhere += ' AND tds.price <= ?'; }
    // if (departure_date) { countSqlWhere += ' AND tds.date = ?'; } // Handled by JOIN condition when departure_date is present in countSqlJoins
    const countSql = countSqlBase + countSqlJoins + countSqlWhere;
    
    // Apply pagination
    const { sql, values: paginationValues, pagination } = paginateQuery(baseSql, { page, limit });
    // Concatenate joinParams, filter values, and pagination values in correct order
    const allValues = [...joinParams, ...values, ...paginationValues];

    // Debugging output
    console.log('Train.filter SQL:', sql);
    console.log('Train.filter VALUES:', allValues);
    
    // Execute count query first
      // Prepare values for the countSql query.
    // The `values` array already contains parameters for the WHERE conditions (from baseSql's WHERE part).
    // We only need to prepend `departure_date` if it's part of the `countSqlJoins`.
    let finalCountValuesForQuery = [];
    if (departure_date && countSqlJoins.includes('tds.date = ?')) {
        finalCountValuesForQuery.push(departure_date);
    }
    finalCountValuesForQuery.push(...values); // Appends all values from the `values` array

    console.log('Train.filter countSQL:', countSql);
    console.log('Train.filter countValues:', finalCountValuesForQuery);

    db.query(countSql, finalCountValuesForQuery, (countErr, countResults) => {
      if (countErr) return callback(countErr, null);
      
      const totalItems = countResults[0].total;
      
      // Then execute the paginated query
      db.query(sql, allValues, (err, results) => {
        if (err) return callback(err, null);
        
        // Format the response with pagination metadata
        const response = paginatedResponse(results, pagination, totalItems);
        callback(null, response);
      });
    });
  },
  getById: (id, departure_date, callback) => {
  if (typeof callback !== 'function') {
    console.error('getById called without a valid callback!', { id, departure_date, callback });
    return;
  }
  let sql, params;
  if (departure_date) {
    sql = `
      SELECT 
        t.id,
        t.train_code AS train_number,
        t.name,
        t.operator,
        t.origin_station_code,
        t.origin_station_name,
        t.origin_city,
        t.origin_province,
        t.destination_station_code,
        t.destination_station_name,
        t.destination_city,
        t.destination_province,
        t.departure_time,
        t.arrival_time,
        t.travel_duration AS duration,
        /* t.train_class, -- train_class is not directly in Trains table based on schema.sql, assuming it was from old structure or meant to be derived 
        t.subclass, -- subclass is not directly in Trains table based on schema.sql */
        t.train_type,
        t.description,
        t.facilities,
        t.created_at,
        t.updated_at,
        tds.price,
        tds.currency,
        /* tp.price_category, -- price_category removed */
        tds.available_seats AS seats_available
      FROM Trains t
      LEFT JOIN TrainDailyStatus tds ON t.id = tds.train_id AND tds.date = ?
      WHERE t.id = ?
      LIMIT 1
    `;
    params = [departure_date, id];
  } else {
    sql = `
      SELECT 
        t.id,
        t.train_code AS train_number,
        t.name,
        t.operator,
        t.origin_station_code,
        t.origin_station_name,
        t.origin_city,
        t.origin_province,
        t.destination_station_code,
        t.destination_station_name,
        t.destination_city,
        t.destination_province,
        t.departure_time,
        t.arrival_time,
        t.travel_duration AS duration,
        /* t.train_class, -- Not in Trains table 
        t.subclass, -- Not in Trains table */
        t.train_type,
        t.description,
        t.facilities,
        t.created_at,
        t.updated_at,
        NULL AS price,
        NULL AS currency,
        /* tp.price_category, -- Removed */
        NULL AS seats_available
      FROM Trains t
      WHERE t.id = ?
      LIMIT 1
    `;
    params = [id];
  }
  console.log('DEBUG getById SQL:', sql, params);
  db.query(sql, params, (err, results) => {
    if (err) return callback(err, null);
    if (!results || !Array.isArray(results) || results.length === 0) return callback(null, null);
    callback(null, results[0]);
  });
},
  getDailyStatus: (trainId, date, callback) => {
    const sql = `
      SELECT 
        tds.train_id, 
        tds.date, 
        tds.available_seats, 
        tds.price, 
        tds.currency 
      FROM TrainDailyStatus tds 
      WHERE tds.train_id = ? AND tds.date = ? 
      LIMIT 1;`;
    const params = [trainId, date];
    db.query(sql, params, (err, results) => {
      if (err) {
        return callback(err, null);
      }
      if (!results || results.length === 0) {
        return callback(null, null); // No status found for this train on this date
      }
      // The DB column names match the GraphQL TrainDailyStatus type fields (trainId, date, availableSeats, price, currency)
      // but the service might return train_id, available_seats. The gateway resolver maps these.
      // For direct service response, ensure consistency or map here if needed.
      // Current selection: train_id, date, available_seats, price, currency.
      // Gateway expects: trainId, date, availableSeats, price, currency.
      // Let's return fields as they are in DB and let gateway map, or map here for consistency.
      // Mapping here for clarity for the service layer:
      const dailyStatusData = results[0];
      callback(null, {
        train_id: dailyStatusData.train_id, // or trainId if preferred for service consistency
        date: dailyStatusData.date, // Ensure date format is YYYY-MM-DD string
        available_seats: dailyStatusData.available_seats, // maps to availableSeats in GQL
        price: dailyStatusData.price,
        currency: dailyStatusData.currency
      });
    });
  },  
  getAvailability: (trainId, date, callback) => {
    db.query('SELECT * FROM TrainAvailability WHERE train_id = ? AND date = ?', [trainId, date], (err, results) => callback(err, results[0]));
  },
  getPricing: (trainId, date, seatClass, callback) => {
    let sql = 'SELECT * FROM TrainPricing WHERE train_id = ? AND date = ?';
    const params = [trainId, date];
    if (seatClass) {
      sql += ' AND (seat_class = ? OR class_type = ? OR train_class = ?)';
      params.push(seatClass, seatClass, seatClass);
    }
    db.query(sql, params, (err, results) => callback(err, results));
  }
};

module.exports = Train;
