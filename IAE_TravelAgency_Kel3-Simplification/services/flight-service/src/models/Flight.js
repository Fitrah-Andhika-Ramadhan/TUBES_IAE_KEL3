const db = require('../config/db').promise(); // Use promise-based connection
const { paginateQuery, paginatedResponse } = require('../utils/pagination');

const Flight = {
  // NOTE: create and update methods are placeholders and not used by the current API,
  // as flight data is assumed to be managed by a separate system.

  // Decrease available seats for a flight and date
  async decreaseAvailability(flightId, date, quantity) {
    const sql = 'UPDATE FlightDailyStatus SET available_seats = available_seats - ? WHERE flight_id = ? AND date = ? AND available_seats >= ?';
    const [result] = await db.query(sql, [quantity, flightId, date, quantity]);
    return result.affectedRows > 0;
  },

  // Increase available seats for a flight and date
  async increaseAvailability(flightId, date, quantity) {
    const sql = 'UPDATE FlightDailyStatus SET available_seats = available_seats + ? WHERE flight_id = ? AND date = ?';
    const [result] = await db.query(sql, [quantity, flightId, date]);
    return result.affectedRows > 0;
  },

  async listAll(params) {
    const baseSql = `SELECT * FROM Flights`;

    const [countResults] = await db.query('SELECT COUNT(*) as total FROM Flights');
    const totalItems = countResults[0].total;

    if (params.page || params.limit) {
      const { sql, values, pagination } = paginateQuery(baseSql, params);
      const [results] = await db.query(sql, values);
      return paginatedResponse(results, pagination, totalItems);
    } else {
      const sql = `${baseSql} ORDER BY id ASC`;
      const [results] = await db.query(sql);
      return { data: results, pagination: null };
    }
  },
  
  async filter(params) {
    const {
      origin_city, destination_city, airline_code, airline_name,
      departure_date, min_price, max_price,
      sort_by, sort_order, page, limit
    } = params;

    let values = [];
    let whereConditions = ['1=1'];

    // Explicitly select all required fields to avoid nulls and match DB schema.
    let selectClause = `SELECT DISTINCT 
      f.id, f.airline_name, f.flight_number, f.origin_name, f.destination_name, 
      f.departure_time, f.arrival_time, f.origin_code, -- Corrected from f.origin_airport_iata
      f.destination_code, -- Corrected from f.destination_airport_iata
      f.airline_code, f.created_at, f.updated_at
      -- Removed: f.flight_status, f.aircraft_model, f.seat_capacity, f.description (not in DB schema)
    `;
    let fromClause = `FROM Flights f`;

    // If filtering by date, price, or sorting by price, a JOIN with FlightDailyStatus is necessary.
    const needsDailyStatusJoin = departure_date || min_price || max_price || sort_by === 'price';
    if (needsDailyStatusJoin) {
      fromClause += ` JOIN FlightDailyStatus fds ON f.id = fds.flight_id`;
      if (departure_date) {
        whereConditions.push('fds.date = ?');
        values.push(departure_date);
      }
      if (min_price) {
        whereConditions.push('fds.price >= ?');
        values.push(min_price);
      }
      if (max_price) {
        whereConditions.push('fds.price <= ?');
        values.push(max_price);
      }
    }

    // Add filters for the Flights table
    if (origin_city) { whereConditions.push('f.origin_city LIKE ?'); values.push(`%${origin_city}%`); }
    if (destination_city) { whereConditions.push('f.destination_city LIKE ?'); values.push(`%${destination_city}%`); }
    if (airline_code) { whereConditions.push('f.airline_code = ?'); values.push(airline_code); }
    if (airline_name) { whereConditions.push('f.airline_name LIKE ?'); values.push(`%${airline_name}%`); }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const countSql = `SELECT COUNT(DISTINCT f.id) as items_count ${fromClause} ${whereClause}`;

    try {
      // 1. Get total count for pagination
      const [countResult] = await db.query(countSql, values);
      // Ensure countResult[0] exists and has the items_count property
      const totalItems = (countResult && countResult[0] && countResult[0].items_count !== undefined) ? countResult[0].items_count : 0;

      // 2. Build the main query with sorting
      let sql = `${selectClause} ${fromClause} ${whereClause}`;
      let orderByClause = ' ORDER BY f.departure_time ASC'; // Default sort
      if (sort_by) {
        const validSortColumns = {
          'departure_time': 'f.departure_time',
          'arrival_time': 'f.arrival_time',
          'price': 'fds.price',
          'airline_name': 'f.airline_name'
        };

        if (validSortColumns[sort_by]) {
          if (sort_by === 'price' && !needsDailyStatusJoin) {
            // Cannot sort by price without a date filter, so we ignore it.
          } else {
            const sortColumnDb = validSortColumns[sort_by];
            const order = sort_order && sort_order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
            orderByClause = ` ORDER BY ${sortColumnDb} ${order}`;
          }
        }
      }
      sql += orderByClause;

      // 3. Apply pagination and execute the final query
      if (page || limit) {
        const { sql: paginatedSql, values: paginationValues, pagination } = paginateQuery(sql, { page, limit });
        const combinedValues = [...values, ...paginationValues];
        const [results] = await db.query(paginatedSql, combinedValues);
        return paginatedResponse(results, pagination, totalItems);
      } else {
        const [results] = await db.query(sql, values);
        return { data: results, pagination: null };
      }
    } catch (err) {
      console.error('Error filtering flights:', err);
      throw err;
    }
  },

  getById: async (id) => {
    const sql = `
      SELECT 
        id, airline_name, flight_number, origin_name, destination_name, 
        departure_time, arrival_time, origin_code, -- Corrected from origin_airport_iata
        destination_code, -- Corrected from destination_airport_iata
        airline_code, created_at, updated_at
        -- Removed: flight_status, aircraft_model, seat_capacity, description (not in DB schema)
      FROM Flights 
      WHERE id = ?
    `;
    try {
      const [results] = await db.query(sql, [id]);
      return results.length > 0 ? results[0] : null;
    } catch (err) {
      console.error('Error fetching flight by ID:', err);
      throw err;
    }
  },

  getDailyStatusById: async (flightId, date) => {
    const sql = 'SELECT * FROM FlightDailyStatus WHERE flight_id = ? AND date = ?';
    try {
      const [results] = await db.query(sql, [flightId, date]);
      return results.length > 0 ? results[0] : null;
    } catch (err) {
      console.error('Error fetching flight daily status:', err);
      throw err; // Re-throw the error to be caught by the controller
    }
  }
};

module.exports = Flight;
