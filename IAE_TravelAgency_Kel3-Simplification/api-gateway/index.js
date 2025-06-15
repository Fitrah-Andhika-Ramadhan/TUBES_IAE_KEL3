require('dotenv').config();
console.log('[API Gateway] JWT_SECRET:', process.env.JWT_SECRET);
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const morgan = require('morgan');
const { startApolloServer } = require('./graphql');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json()); // Added to parse JSON request bodies
app.use(morgan('dev'));

// Proxy configuration for each microservice
const services = {
  users:    { target: process.env.USERS_SERVICE_URL || 'http://users-service:3001', path: '/api/users' },
  flights:  { target: process.env.FLIGHTS_SERVICE_URL || 'http://flight-service:3002', path: '/api/flights' },
  hotels:   { target: process.env.HOTELS_SERVICE_URL || 'http://hotel-service:3003', path: '/api/hotels' },
  bookings: { target: process.env.BOOKINGS_SERVICE_URL || 'http://booking-service:3004', path: '/api/bookings' },
  payments: { target: process.env.PAYMENTS_SERVICE_URL || 'http://payment-service:3005', path: '/api/payments' },
  local:    { target: process.env.LOCAL_TRAVEL_SERVICE_URL || 'http://local-travel-service:3006', path: '/api/local-travel' },
  trains:   { target: process.env.TRAINS_SERVICE_URL || 'http://train-service:3007', path: '/api/trains' }
};

// Register proxy routes
Object.values(services).forEach(service => {
  app.use(service.path, createProxyMiddleware({ target: service.target, changeOrigin: true }));
});

app.get('/', (req, res) => {
  res.send('API Gateway is running');
});

// Start Apollo GraphQL Server and then listen
console.log('[API Gateway] Initializing Apollo Server...');
startApolloServer(app) // Pass the main app instance
  .then((initializedApp) => {
    console.log('[API Gateway] Apollo Server initialized. returnedApp === app:', initializedApp === app);
    console.log(`[API Gateway] Attempting to listen on port ${PORT}...`);
    initializedApp.listen(PORT, () => {
      console.log(`[API Gateway] Successfully listening on port ${PORT}`);
      console.log(`[API Gateway] GraphQL endpoint available at http://localhost:${PORT}/graphql`);
      console.log(`[API Gateway] Root endpoint available at http://localhost:${PORT}/`);
    });
  })
  .catch(error => {
    console.error('[API Gateway] Failed to start Apollo Server or listen:', error);
    process.exit(1); // Exit if server fails to start
  });
