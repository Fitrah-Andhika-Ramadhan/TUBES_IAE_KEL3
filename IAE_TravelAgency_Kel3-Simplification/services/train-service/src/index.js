
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const trainRoutes = require('./routes/trainRoutes');
const logger = require('./logger');

const app = express();
const PORT = process.env.PORT || 3007;

app.use(cors());
app.use(bodyParser.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} from ${req.ip}`);
  next();
});

// Train API routes
app.use('/api/trains', trainRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'train-service', time: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send('Train Service is running');
});

// Error handler middleware
app.use((err, req, res, next) => {
  logger.error('Error:', err);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
});

app.listen(PORT, () => {
  logger.info(`Train Service listening on port ${PORT}`);
});
