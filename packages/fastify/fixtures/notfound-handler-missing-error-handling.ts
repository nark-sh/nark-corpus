/**
 * MISSING error handling for fastify setNotFoundHandler.
 * These patterns SHOULD trigger violations for:
 *   - setnotfoundhandler-called-after-start (called after listen/ready)
 *   - setnotfoundhandler-already-set (called twice in same scope)
 *   - setnotfoundhandler-handler-throws-routes-via-error-handler (handler does I/O without try-catch)
 *
 * Added 2026-06-18 by bc-deepen-contract pass 15.
 */
import fastify from 'fastify';

// @expect-violation: setnotfoundhandler-called-after-start
// setNotFoundHandler() invoked after listen() — throws synchronously at server start time.
async function setNotFoundAfterListenIsAnError() {
  const app = fastify();
  app.get('/health', async () => ({ status: 'ok' }));
  await app.listen({ port: 3000, host: '0.0.0.0' });
  // No try-catch and the call is forbidden after start — Fastify throws
  // "Cannot call \"setNotFoundHandler\" when fastify instance is already started!"
  app.setNotFoundHandler((req, reply) => {
    reply.code(404).send({ message: 'Not Found' });
  });
}

// @expect-violation: setnotfoundhandler-already-set
// Registering twice in the same encapsulated scope throws synchronously.
function setNotFoundTwiceIsAnError() {
  const app = fastify();
  app.setNotFoundHandler((req, reply) => {
    reply.code(404).send({ message: 'Not Found' });
  });
  // Throws: "Not found handler already set for Fastify instance with prefix: '/'"
  app.setNotFoundHandler((req, reply) => {
    reply.code(404).send({ message: 'Not Found (override)' });
  });
  return app;
}

// @expect-violation: setnotfoundhandler-handler-throws-routes-via-error-handler
// The 404 handler does I/O and may throw — error is routed through setErrorHandler,
// NOT back through the 404 path. The client sees 500 instead of 404, which makes
// debugging confusing because client logs show a 500 for what should be a 404 route.
function setNotFoundHandlerDoesUnprotectedIO() {
  const app = fastify();
  app.setNotFoundHandler(async (req, reply) => {
    // No try-catch: if logUnknownRouteAttempt() throws, response becomes 500
    // (routed through setErrorHandler), not the intended 404.
    await logUnknownRouteAttempt(req.url, req.headers['user-agent'] ?? '');
    reply.code(404).send({ message: 'Not Found' });
  });
  return app;
}

declare function logUnknownRouteAttempt(url: string, userAgent: string): Promise<void>;
