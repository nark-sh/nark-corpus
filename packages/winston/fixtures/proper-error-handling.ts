/**
 * Proper winston Configuration
 * Should produce 0 violations
 */

import winston from 'winston';

// ✅ With error event handler
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// ✅ Error event listeners
logger.on('error', (error) => {
  console.error('Logger error:', error);
});

logger.transports.forEach(transport => {
  transport.on('error', (error) => {
    console.error('Transport error:', error);
  });
});

// ✅ Try-catch around logging
async function logWithErrorHandling(message: string) {
  try {
    logger.info(message);
  } catch (error) {
    console.error('Failed to log:', error);
  }
}

export { logger, logWithErrorHandling };
