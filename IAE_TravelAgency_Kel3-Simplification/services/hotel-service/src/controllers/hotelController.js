const Hotel = require('../models/Hotel');

// Create a new Hotel entry
exports.createHotel = (req, res) => {
  const data = req.body;
  Hotel.create(data, (err, result) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Failed to create hotel', details: err.message });
    // Fetch the created entry by insertId
    Hotel.getById(result.insertId, (err2, created) => {
      if (err2) return res.status(500).json({ status: 'error', message: 'Created but failed to retrieve', details: err2.message });
      res.status(201).json({ status: 'success', data: created });
    });
  });
};

// Update an existing Hotel entry
exports.updateHotel = (req, res) => {
  const id = req.params.id;
  const data = req.body;
  Hotel.update(id, data, (err, result) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Failed to update hotel', details: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ status: 'error', message: 'Hotel not found or no changes made' });
    // Fetch the updated entry
    Hotel.getById(id, (err2, updated) => {
      if (err2) return res.status(500).json({ status: 'error', message: 'Updated but failed to retrieve', details: err2.message });
      res.json({ status: 'success', data: updated });
    });
  });
};

// Decrease room availability (booking)
exports.decreaseAvailability = (req, res) => {
  const hotelId = req.params.id;
  const { room_type_name, date, quantity = 1 } = req.body;
  if (!room_type_name || !date) {
    return res.status(400).json({ status: 'error', message: 'Missing room_type_name or date' });
  }
  Hotel.decreaseAvailability(hotelId, room_type_name, date, quantity, (err, result) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Failed to decrease availability', details: err.message });
    }
    res.json({ status: 'success', message: 'Availability decreased', affectedRows: result.affectedRows });
  });
};

// Increase room availability (cancellation)
exports.increaseAvailability = (req, res) => {
  const hotelId = req.params.id;
  const { room_type_name, date, quantity = 1 } = req.body;
  if (!room_type_name || !date) {
    return res.status(400).json({ status: 'error', message: 'Missing room_type_name or date' });
  }
  Hotel.increaseAvailability(hotelId, room_type_name, date, quantity, (err, result) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Failed to increase availability', details: err.message });
    }
    res.json({ status: 'success', message: 'Availability increased', affectedRows: result.affectedRows });
  });
};

// [DEPRECATED] searchHotels: /search endpoint is deprecated. Use filterHotels instead.
// exports.searchHotels = (req, res) => {
//   const { city, province } = req.query;
//   Hotel.search({ city, province }, (err, hotels) => {
//     if (err) return res.status(500).json({ status: 'error', message: 'Search failed' });
//     res.json({ status: 'success', data: hotels });
//   });
// };
// See filterHotels for all search/filter logic.

exports.listAllHotels = (req, res) => {
  // Extract pagination parameters from query string
  const { page, limit } = req.query;
  
  Hotel.listAll({ page, limit }, (err, result) => {
    if (err) return res.status(500).json({ status: 'error', message: 'Failed to retrieve hotels' });
    
    // Return data and pagination metadata
    res.json({
      status: 'success',
      data: result.data,
      pagination: result.pagination
    });
  });
};

exports.filterHotels = (req, res) => {
  // Extract all potential filter parameters from the query string.
  const { 
    // Hotel specific
    name, city, province, stars, property_type, facilities,
    // DailyStatus specific
    date, room_type_name, min_price, max_price,
    // Control parameters
    sort_by, sort_order, page, limit
  } = req.query;
  
  // Build the params object for the model, converting types where necessary.
  const params = {
    name,
    city, 
    province, 
    stars: stars ? parseInt(stars, 10) : undefined,
    property_type,
    facilities,
    date, // Pass date directly, the model handles the logic
    room_type_name,
    min_price: min_price ? parseFloat(min_price) : undefined,
    max_price: max_price ? parseFloat(max_price) : undefined,
    sort_by,
    sort_order,
    page: page ? parseInt(page, 10) : 1,
    limit: limit ? parseInt(limit, 10) : 10
  };

  // Call the newly refactored Hotel.filter method
  Hotel.filter(params, (err, result) => {
    if (err) {
      console.error('Hotel filter failed:', err);
      return res.status(500).json({ status: 'error', message: 'Filter failed', details: err.message });
    }
    
    // Return the paginated data from the model
    res.json({
      status: 'success',
      data: result.data,
      pagination: result.pagination
    });
  });
};

exports.getHotelDetails = (req, res) => {
  const id = req.params.id;
  Hotel.getById(id, (err, hotel) => {
    if (!hotel) return res.status(404).json({ status: 'error', message: 'Hotel not found' });
    res.json({ status: 'success', data: hotel });
  });
};

// Get combined daily status (availability and pricing) for a hotel on a specific date
exports.getHotelDailyStatus = (req, res) => {
  const hotelId = req.params.id;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ status: 'error', message: 'Missing date query parameter' });
  }

  Hotel.getDailyStatus(hotelId, date, (err, results) => {
    if (err) {
      console.error(`Error in getHotelDailyStatus for hotelId ${hotelId}, date ${date}:`, err);
      return res.status(500).json({ status: 'error', message: 'Failed to retrieve hotel daily status', details: err.message });
    }

    // The model now returns a combined result. We just need to format it for the client.
    const formattedResults = results.map(item => ({
      roomTypeName: item.room_type_name,
      date: item.date, // Pass through the date from the model
      availableRooms: item.available_rooms,
      price: item.price,
      currency: item.currency
    }));

    res.json({ status: 'success', data: formattedResults });
  });
};
