const Train = require('../models/Train');

// Create a new Train entry
exports.createTrain = (req, res) => {
  const data = req.body;
  Train.create(data, (err, result) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Failed to create train', details: err.message });
    // Fetch the created entry by insertId (optional: for now just return id)
    res.status(201).json({ status: 'success', data: { id: result.insertId } });
  });
};

exports.searchTrains = (req, res) => {
  const { origin_station_code, destination_station_code, origin_city, destination_city, origin_province, destination_province } = req.query;
  Train.search({ origin_station_code, destination_station_code, origin_city, destination_city, origin_province, destination_province }, (err, trains) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Search failed' });
    res.json({ status: 'success', data: trains });
  });
};

exports.listAllTrains = (req, res) => {
  // Extract pagination parameters from query string
  const { page, limit } = req.query;
  
  Train.listAll({ page, limit }, (err, result) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Failed to retrieve trains' });
    
    // Return data and pagination metadata
    res.json({
      status: 'success',
      data: result.data,
      pagination: result.pagination
    });
  });
};

exports.filterTrains = (req, res) => {
  console.log('Incoming /filter query:', req.query);
  const { 
    origin_station_code, destination_station_code, origin_city, destination_city,
    origin_province, destination_province, train_class, subclass, train_type,
    operator, min_duration, max_duration, price_category,
    min_price, max_price, departure_date, sort_by, sort_order,
    page, limit
  } = req.query;
  
  // Convert string parameters to appropriate types
  const params = {
    // Indonesian-specific fields
    origin_station_code,
    destination_station_code,
    origin_city,
    destination_city,
    origin_province,
    destination_province,
    subclass,
    train_type,
    price_category,
    
    // Original fields
    train_class,
    operator,
    min_duration: min_duration ? parseInt(min_duration) : undefined,
    max_duration: max_duration ? parseInt(max_duration) : undefined,
    min_price: min_price ? parseFloat(min_price) : undefined,
    max_price: max_price ? parseFloat(max_price) : undefined,
    departure_date,
    sort_by,
    sort_order,
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 10
  };
  console.log('Converted filter params:', params);
  
  Train.filter(params, (err, result) => {
    if (err) {
      console.error('Train.filter error:', err);
      return res.status(500).json({ status: 'error', message: 'Filter failed', details: err.message });
    }

    // Return data and pagination metadata
    res.json({
      status: 'success',
      data: result.data,
      pagination: result.pagination
    });
  });
};

exports.getTrainDetails = (req, res) => {
  const id = req.params.id;
  Train.getById(id, null, (err, train) => {
    if (!train) return res.status(404).json({ status: 'error', message: 'Train not found' });
    res.json({ status: 'success', data: train });
  });
};

exports.getDailyStatus = (req, res) => {
  const trainId = req.params.id;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ status: 'error', message: 'Date query parameter is required for daily status.' });
  }

  Train.getDailyStatus(trainId, date, (err, dailyStatus) => {
    if (err) {
      console.error(`Error fetching daily status for train ${trainId}, date ${date}:`, err);
      return res.status(500).json({ status: 'error', message: 'Failed to retrieve daily status.', details: err.message });
    }
    res.json({ status: 'success', data: dailyStatus });
  });
};

exports.getAvailability = (req, res) => {
  const id = req.params.id;
  const { date } = req.query;
  if (!date) return res.status(400).json({ status: 'error', message: 'Missing date parameter' });
  Train.getAvailability(id, date, (err, avail) => {
    res.json({ status: 'success', data: avail ? avail.available_seats : 0 });
  });
};

exports.getPricing = (req, res) => {
  const id = req.params.id;
  const { date, seatClass } = req.query;
  if (!date) return res.status(400).json({ status: 'error', message: 'Missing date parameter' });
  Train.getPricing(id, date, seatClass, (err, pricing) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Pricing query failed', details: err.message });
    if (!pricing || (Array.isArray(pricing) && pricing.length === 0)) return res.status(404).json({ status: 'error', message: 'No pricing found' });
    const result = Array.isArray(pricing) ? pricing : [pricing];
    const mapped = result.map(row => ({
      price: row.price,
      currency: row.currency || 'IDR',
      date: row.date || null,
      seat_class: row.seat_class || row.class_type || row.train_class || null
    }));
    res.json({ status: 'success', data: mapped });
  });
};

// Decrease train seat availability
exports.decreaseAvailability = (req, res) => {
  const trainId = req.params.id;
  const { date, quantity = 1 } = req.body;
  if (!date) {
    return res.status(400).json({ status: 'error', message: 'Missing date' });
  }
  Train.decreaseAvailability(trainId, date, quantity, (err, result) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Failed to decrease availability', details: err.message });
    }
    res.json({ status: 'success', message: 'Availability decreased', affectedRows: result.affectedRows });
  });
};

// Increase train seat availability
exports.increaseAvailability = (req, res) => {
  const trainId = req.params.id;
  const { date, quantity = 1 } = req.body;
  if (!date) {
    return res.status(400).json({ status: 'error', message: 'Missing date' });
  }
  Train.increaseAvailability(trainId, date, quantity, (err, result) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Failed to increase availability', details: err.message });
    }
    res.json({ status: 'success', message: 'Availability increased', affectedRows: result.affectedRows });
  });
};
