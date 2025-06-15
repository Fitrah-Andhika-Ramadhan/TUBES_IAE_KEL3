const express = require('express');
const router = express.Router();
const trainController = require('../controllers/trainController');

// List all trains
router.get('/', trainController.listAllTrains);
// Create a new train entry (admin/dev only)
router.post('/', trainController.createTrain);

// Filter trains with multiple criteria
router.get('/filter', trainController.filterTrains);

// Search trains (basic search with origin/destination)
router.get('/search', trainController.searchTrains);

// Get train details
router.get('/:id', trainController.getTrainDetails);

// Get daily status (availability and pricing) for a train (requires date query param)
router.get('/:id/daily-status', trainController.getDailyStatus);

// Get availability for a train (requires date param)
router.get('/:id/availability', trainController.getAvailability);

// Get pricing for a train (requires date param)
router.get('/:id/pricing', trainController.getPricing);

// Decrease train seat availability (booking)
router.post('/:id/availability/decrease', trainController.decreaseAvailability);
// Increase train seat availability (cancellation)
router.post('/:id/availability/increase', trainController.increaseAvailability);

module.exports = router;
