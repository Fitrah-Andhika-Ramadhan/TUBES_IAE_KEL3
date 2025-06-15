
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bookingRoutes = require('./routes/bookingRoutes');

const logger = require('./logger');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(bodyParser.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} from ${req.ip}`);
  next();
});

// REST API routes
app.use('/api/bookings', bookingRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'booking-service', time: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send('Booking Service is running');
});

// Error handler middleware
app.use((err, req, res, next) => {
  logger.error('Error:', err);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
});

app.listen(PORT, () => {
  logger.info(`Booking Service listening on port ${PORT}`);
});
