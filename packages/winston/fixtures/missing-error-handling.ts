/**
 * Missing winston Error Handling
 * Should produce WARNING violations
 */

import winston from 'winston';

// ⚠️ No error event handler
const logger = winston.createLogger({
  transports: [new winston.transports.File({ filename: 'app.log' })]
});

// ⚠️ No transport error handling
logger.info('Message');

// ⚠️ handleExceptions without proper config
const loggerWithExceptions = winston.createLogger({
  transports: [
    new winston.transports.File({
      filename: 'exceptions.log',
      handleExceptions: true
    })
  ]
});

export { logger, loggerWithExceptions };
