
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const localTravelRoutes = require('./routes/localTravelRoutes');
const logger = require('./logger');

const app = express();
const PORT = process.env.PORT || 3006;

app.use(cors());
app.use(bodyParser.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} from ${req.ip}`);
  next();
});

// Local Travel API routes
app.use('/api/local-travel', localTravelRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'local-travel-service', time: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send('Local Travel Service is running');
});

// Error handler middleware
app.use((err, req, res, next) => {
  logger.error('Error:', err);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
});

app.listen(PORT, () => {
  logger.info(`Local Travel Service listening on port ${PORT}`);
});
