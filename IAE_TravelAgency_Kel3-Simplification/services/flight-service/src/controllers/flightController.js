const Flight = require('../models/Flight');

exports.createFlight = async (req, res) => {
  try {
    const createdFlight = await Flight.create(req.body);
    res.status(201).json({ status: 'success', data: createdFlight });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to create flight', details: error.message });
  }
};

exports.updateFlight = async (req, res) => {
  try {
    const wasUpdated = await Flight.update(req.params.id, req.body);
    if (!wasUpdated) {
      return res.status(404).json({ status: 'error', message: 'Flight not found or no changes made' });
    }
    const updatedFlight = await Flight.getById(req.params.id);
    res.json({ status: 'success', data: updatedFlight });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to update flight', details: error.message });
  }
};

exports.decreaseAvailability = async (req, res) => {
  console.log('[FlightController] decreaseAvailability: req.body:', JSON.stringify(req.body));
  console.log('[FlightController] decreaseAvailability: req.headers[content-type]:', req.headers['content-type']);
  const { id } = req.params;
  const { date, quantity = 1 } = req.body;
  if (!date) {
    return res.status(400).json({ status: 'error', message: 'Missing date' });
  }
  try {
    const wasDecreased = await Flight.decreaseAvailability(id, date, quantity);
    if (wasDecreased) {
      res.json({ status: 'success', message: 'Availability decreased' });
    } else {
      res.status(400).json({ status: 'error', message: 'Failed to decrease availability (e.g., insufficient seats)' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to decrease availability', details: error.message });
  }
};

exports.increaseAvailability = async (req, res) => {
  const { id } = req.params;
  const { date, quantity = 1 } = req.body;
  if (!date) {
    return res.status(400).json({ status: 'error', message: 'Missing date' });
  }
  try {
    await Flight.increaseAvailability(id, date, quantity);
    res.json({ status: 'success', message: 'Availability increased' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to increase availability', details: error.message });
  }
};

exports.listAllFlights = async (req, res) => {
  try {
    const result = await Flight.listAll(req.query);
    res.json({ status: 'success', ...result });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to retrieve flights', details: error.message });
  }
};

exports.filterFlights = async (req, res) => {
  try {
    const result = await Flight.filter(req.query);
    res.json({ status: 'success', ...result });
  } catch (error) {
    console.error('Error in filterFlights controller:', error);
    res.status(500).json({ status: 'error', message: 'Filter failed', details: error.message });
  }
};

exports.getFlightDetails = async (req, res) => {
  try {
    const flight = await Flight.getById(req.params.id);
    if (!flight) {
      return res.status(404).json({ status: 'error', message: 'Flight not found' });
    }
    res.json({ status: 'success', data: flight });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to get flight details', details: error.message });
  }
};

exports.getDailyStatus = async (req, res) => {
  const { id } = req.params;
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ status: 'error', message: 'Date query parameter is required' });
  }
  try {
    const dailyStatus = await Flight.getDailyStatusById(id, date);
    if (!dailyStatus || dailyStatus.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No daily status found for the given flight and date' });
    }
    res.json({ status: 'success', data: dailyStatus });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to get daily status', details: error.message });
  }
};
