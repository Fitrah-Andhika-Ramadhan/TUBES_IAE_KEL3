const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');

// List all flights
router.get('/', flightController.listAllFlights);
// Create a new flight entry (admin/dev only)
router.post('/', flightController.createFlight);
// Update an existing flight entry (admin/dev only)
router.put('/:id', flightController.updateFlight);

// Filter flights with multiple criteria
router.get('/filter', flightController.filterFlights);

// Get flight details
router.get('/:id', flightController.getFlightDetails);

// Get daily status (availability and pricing) for a flight
router.get('/:id/daily-status', flightController.getDailyStatus);

// Decrease flight seat availability (booking)
router.post('/:id/availability/decrease', flightController.decreaseAvailability);

// Increase flight seat availability (cancellation)
router.post('/:id/availability/increase', flightController.increaseAvailability);

module.exports = router;
