// Simple Winston logger setup for microservice logging
const fs = require('fs');
const path = require('path');
const { createLogger, format, transports } = require('winston');

// Ensure logs directory exists
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: path.join(logDir, 'flight-service-error.log'), level: 'error' }),
    new transports.File({ filename: path.join(logDir, 'flight-service-combined.log') })
  ],
});

module.exports = logger;
