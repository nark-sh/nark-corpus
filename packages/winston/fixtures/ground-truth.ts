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

// =============================================================================
// Phase 4 additions — deepen pass 2026-04-16
// New postconditions: query, transports.File, transports.Http, configure, add
// =============================================================================

// --- query() error handling ---

// @expect-violation: query-unhandled-callback-error
// Missing error check in query callback — err argument ignored
function fetchRecentLogsViolation(logger: winston.Logger): void {
  logger.query({ from: new Date(Date.now() - 3600000), until: new Date(), limit: 10 }, function(err, results) {
    // ❌ err is never checked — transport query failures silently return undefined results
    console.log(JSON.stringify(results));
  });
}

// @expect-clean
// Proper error handling in query callback
function fetchRecentLogsClean(logger: winston.Logger): void {
  logger.query({ from: new Date(Date.now() - 3600000), until: new Date(), limit: 10 }, function(err, results) {
    if (err) {
      console.error('Log query failed:', err);
      return;
    }
    console.log(JSON.stringify(results));
  });
}

// --- transports.File() per-transport error listener ---

// @expect-violation: file-transport-missing-per-transport-error-listener
// File transport without per-transport error listener
const fileTransportViolation = new winston.transports.File({ filename: 'errors.log' });
const loggerWithFileViolation = winston.createLogger({
  transports: [fileTransportViolation]
});
// ❌ No fileTransportViolation.on('error', handler) — disk errors silently lost

// @expect-clean
// File transport with per-transport error listener
const fileTransportClean = new winston.transports.File({ filename: 'errors.log' });
fileTransportClean.on('error', (err: Error) => {
  console.error('File transport error (disk full / permission denied):', err);
});
const loggerWithFileClean = winston.createLogger({
  transports: [fileTransportClean]
});
loggerWithFileClean.on('error', (err: Error) => {
  console.error('Logger error:', err);
});

// --- transports.Http() warn-not-error pattern ---

// @expect-violation: http-transport-warn-not-error-on-failure
// HTTP transport only listening for 'error', missing 'warn' listener
const httpTransportViolation = new winston.transports.Http({ host: 'logs.example.com', port: 9999 });
httpTransportViolation.on('error', (err: Error) => {
  console.error('HTTP transport error:', err);
});
// ❌ Missing httpTransportViolation.on('warn', handler) — network failures are emitted as 'warn', not 'error'
const loggerWithHttpViolation = winston.createLogger({ transports: [httpTransportViolation] });

// @expect-clean
// HTTP transport with both 'error' and 'warn' listeners
const httpTransportClean = new winston.transports.Http({ host: 'logs.example.com', port: 9999 });
httpTransportClean.on('error', (err: Error) => {
  console.error('HTTP transport error:', err);
});
httpTransportClean.on('warn', (err: Error) => {
  console.warn('HTTP transport network warning (request failed):', err);
});
const loggerWithHttpClean = winston.createLogger({ transports: [httpTransportClean] });
loggerWithHttpClean.on('error', (err: Error) => console.error('Logger error:', err));

export {
  fetchRecentLogsViolation, fetchRecentLogsClean,
  fileTransportViolation, loggerWithFileViolation,
  fileTransportClean, loggerWithFileClean,
  httpTransportViolation, loggerWithHttpViolation,
  httpTransportClean, loggerWithHttpClean,
};
