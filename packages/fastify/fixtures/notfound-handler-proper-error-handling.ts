/**
 * PROPER error handling for fastify setNotFoundHandler.
 * These patterns should NOT trigger violations.
 *
 * Added 2026-06-18 by bc-deepen-contract pass 15.
 */
import fastify from 'fastify';

// @expect-clean
// setNotFoundHandler() called BEFORE listen() — safe.
async function setNotFoundBeforeListenIsClean() {
  const app = fastify();
  app.setNotFoundHandler((req, reply) => {
    reply.code(404).send({ message: 'Not Found' });
  });
  app.get('/health', async () => ({ status: 'ok' }));
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// @expect-clean
// Each plugin scope can have its own 404 handler — calling once per scope is fine.
function setNotFoundPerScopeIsClean() {
  const app = fastify();
  app.setNotFoundHandler((req, reply) => {
    reply.code(404).send({ message: 'Root 404' });
  });
  app.register(
    async (instance) => {
      instance.setNotFoundHandler((req, reply) => {
        reply.code(404).send({ message: 'API 404' });
      });
      instance.get('/users', async () => []);
    },
    { prefix: '/api' }
  );
  return app;
}

// @expect-clean
// I/O inside the 404 handler is wrapped in try-catch so a failed log call still returns 404.
function setNotFoundHandlerWrapsIO() {
  const app = fastify();
  app.setNotFoundHandler(async (req, reply) => {
    try {
      await logUnknownRouteAttempt(req.url, req.headers['user-agent'] ?? '');
    } catch (err) {
      // Logging failure must NOT change the response status — clients should still see 404.
      req.log.warn({ err }, 'failed to log unknown-route attempt');
    }
    reply.code(404).send({ message: 'Not Found' });
  });
  return app;
}

declare function logUnknownRouteAttempt(url: string, userAgent: string): Promise<void>;
