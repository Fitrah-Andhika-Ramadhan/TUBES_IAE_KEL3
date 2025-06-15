const LocalTravel = require('../models/LocalTravel');

// Create a new LocalTravel entry
exports.createLocalTravel = (req, res) => {
  const data = req.body;
  LocalTravel.create(data, (err, result) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Failed to create local travel', details: err.message });
    // Fetch the created entry by insertId
    LocalTravel.getById(result.insertId, (err2, created) => {
      if (err2) return res.status(500).json({ status: 'error', message: 'Created but failed to retrieve', details: err2.message });
      res.status(201).json({ status: 'success', data: created });
    });
  });
};

// Update an existing LocalTravel entry
exports.updateLocalTravel = (req, res) => {
  const id = req.params.id;
  const data = req.body;
  LocalTravel.update(id, data, (err, result) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Failed to update local travel', details: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ status: 'error', message: 'Local travel not found or no changes made' });
    // Fetch the updated entry
    LocalTravel.getById(id, (err2, updated) => {
      if (err2) return res.status(500).json({ status: 'error', message: 'Updated but failed to retrieve', details: err2.message });
      res.json({ status: 'success', data: updated });
    });
  });
};

exports.searchLocalTravel = (req, res) => {
  const { origin_city, destination_city, route } = req.query;
  LocalTravel.search({ origin_city, destination_city, route }, (err, options) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Search failed' });
    res.json({ status: 'success', data: options });
  });
};

exports.listAllLocalTravel = (req, res) => {
  // Extract pagination parameters from query string
  const { page, limit } = req.query;
  
  LocalTravel.listAll({ page, limit }, (err, result) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Failed to retrieve local travel options' });
    
    // Return data and pagination metadata
    res.json({
      status: 'success',
      data: result.data,
      pagination: result.pagination
    });
  });
};

exports.filterLocalTravel = (req, res) => {
  console.log('Incoming /filter query:', req.query);
  const { 
    origin_city, destination_city, origin_province, destination_province,
    origin_kabupaten, destination_kabupaten, type, operator_name, provider,
    route, min_capacity, max_capacity,
    has_ac, has_wifi, min_price, max_price, sort_by, sort_order,
    page, limit
  } = req.query;
  
  // Convert string parameters to appropriate types
  const params = {
    // Indonesian-specific fields
    origin_city,
    destination_city,
    origin_province,
    destination_province,
    origin_kabupaten,
    destination_kabupaten,
    
    // Original fields
    type,
    operator_name,
    provider,
    route,
    min_capacity: min_capacity ? parseInt(min_capacity) : undefined,
    max_capacity: max_capacity ? parseInt(max_capacity) : undefined,
    has_ac: has_ac !== undefined ? has_ac === 'true' : undefined,
    has_wifi: has_wifi !== undefined ? has_wifi === 'true' : undefined,
    min_price: min_price ? parseFloat(min_price) : undefined,
    max_price: max_price ? parseFloat(max_price) : undefined,
    sort_by,
    sort_order,
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 10
  };
  console.log('Converted filter params:', params);
  
  LocalTravel.filter(params, (err, result) => {
    if (err) {
      console.error('LocalTravel.filter error:', err);
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

exports.getLocalTravelDetails = (req, res) => {
  const id = req.params.id;
  LocalTravel.getById(id, (err, option) => {
    if (!option) return res.status(404).json({ status: 'error', message: 'Option not found' });
    res.json({ status: 'success', data: option });
  });
};

exports.getDailyStatus = (req, res) => {
  const id = req.params.id;
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ status: 'error', message: 'Missing date parameter' });
  }

  LocalTravel.getDailyStatus(id, date, (err, status) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Failed to get daily status', details: err.message });
    }
    if (!status) {
      return res.status(404).json({ status: 'error', message: 'No status found for this date' });
    }
    res.json({ status: 'success', data: status });
  });
};

// Decrease local travel unit availability
exports.decreaseAvailability = (req, res) => {
  const localTravelId = req.params.id;
  const { date, quantity = 1 } = req.body;
  if (!date) {
    return res.status(400).json({ status: 'error', message: 'Missing date' });
  }
  LocalTravel.decreaseAvailability(localTravelId, date, quantity, (err, result) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Failed to decrease availability', details: err.message });
    }
    res.json({ status: 'success', message: 'Availability decreased', affectedRows: result.affectedRows });
  });
};

// Increase local travel unit availability
exports.increaseAvailability = (req, res) => {
  const localTravelId = req.params.id;
  const { date, quantity = 1 } = req.body;
  if (!date) {
    return res.status(400).json({ status: 'error', message: 'Missing date' });
  }
  LocalTravel.increaseAvailability(localTravelId, date, quantity, (err, result) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Failed to increase availability', details: err.message });
    }
    res.json({ status: 'success', message: 'Availability increased', affectedRows: result.affectedRows });
  });
};
