
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const flightRoutes = require('./routes/flightRoutes');
const logger = require('./logger');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(bodyParser.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} from ${req.ip}`);
  next();
});

// Flight API routes
app.use('/api/flights', flightRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'flight-service', time: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send('Flight Service is running');
});

// Error handler middleware
app.use((err, req, res, next) => {
  logger.error('Error:', err);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
});

app.listen(PORT, () => {
  logger.info(`Flight Service listening on port ${PORT}`);
});
