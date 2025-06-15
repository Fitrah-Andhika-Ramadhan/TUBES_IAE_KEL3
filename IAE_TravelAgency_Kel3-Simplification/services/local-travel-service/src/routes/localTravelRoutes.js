const express = require('express');
const router = express.Router();
const localTravelController = require('../controllers/localTravelController');

// List all local travel options
router.get('/', localTravelController.listAllLocalTravel);
// Create a new local travel entry (admin/dev only)
router.post('/', localTravelController.createLocalTravel);
// Update an existing local travel entry (admin/dev only)
router.put('/:id', localTravelController.updateLocalTravel);

// Filter local travel options with multiple criteria
router.get('/filter', localTravelController.filterLocalTravel);

// Search local travel options (basic search with city/route)
router.get('/search', localTravelController.searchLocalTravel);

// Get local travel details
router.get('/:id', localTravelController.getLocalTravelDetails);

// Get daily status (availability and pricing) for a local travel option
router.get('/:id/daily-status', localTravelController.getDailyStatus);

// Decrease local travel unit availability (booking)
router.post('/:id/availability/decrease', localTravelController.decreaseAvailability);
// Increase local travel unit availability (cancellation)
router.post('/:id/availability/increase', localTravelController.increaseAvailability);

module.exports = router;
