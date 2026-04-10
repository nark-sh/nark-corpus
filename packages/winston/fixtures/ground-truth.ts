/**
 * Winston ground-truth fixture
 *
 * Annotated with SHOULD_FIRE and SHOULD_NOT_FIRE for ground-truth test validation.
 * Tests the missing-error-listener postcondition on createLogger.
 */

import winston from 'winston';

// =============================================================================
// SHOULD_FIRE cases — createLogger without error event listener
// =============================================================================

// SHOULD_FIRE: missing-error-listener — createLogger() with no .on('error') listener. Transport errors silently lost.
const logger1 = winston.createLogger({
  transports: [new winston.transports.Console()]
});
logger1.info('Starting app');

// SHOULD_FIRE: missing-error-listener — File transport without error listener. File write failures silently swallowed.
const logger2 = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: 'app.log' })
  ]
});

// =============================================================================
// SHOULD_NOT_FIRE cases — createLogger with proper error event listener
// =============================================================================

// SHOULD_NOT_FIRE: logger.on('error', ...) properly attached — satisfies error handling requirement
const logger3 = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
logger3.on('error', (err) => {
  console.error('Logger error:', err);
});

// SHOULD_NOT_FIRE: error listener attached in separate statement same scope — satisfies requirement
const logger4 = winston.createLogger({
  transports: [new winston.transports.Console()]
});
logger4.info('Starting');
logger4.on('error', (err) => console.error('Logger transport error:', err));

export { logger1, logger2, logger3, logger4 };
