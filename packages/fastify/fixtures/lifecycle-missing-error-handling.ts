/**
 * MISSING error handling for fastify lifecycle methods.
 * These patterns should trigger violations for:
 *   - listen-port-in-use (listen not awaited in try-catch)
 *   - listen-plugin-timeout (listen not awaited in try-catch)
 *   - close-websocket-connection-leak (close not awaited in try-catch)
 *   - ready-plugin-timeout (ready not awaited in try-catch)
 *   - register-errors-deferred-to-ready (register called but ready/listen not wrapped)
 *   - after-error-parameter-unchecked (err param ignored in after callback)
 */
import fastify from 'fastify';
import fp from 'fastify-plugin';

// ❌ listen() not wrapped in try-catch — EADDRINUSE and ERR_AVVIO_PLUGIN_TIMEOUT are unhandled
async function startServerNoErrorHandling() {
  const app = fastify();
  app.get('/health', async () => ({ status: 'ok' }));
  // Missing: try-catch around listen
  await app.listen({ port: 3000 });
}

// ❌ listen() with localhost binding in container — silent connectivity failure
async function startServerLocalhostOnly() {
  const app = fastify();
  // Missing: should use host: '0.0.0.0' in containerized deployments
  await app.listen({ port: 3000, host: '127.0.0.1' });
}

// ❌ close() not wrapped in try-catch — hook errors swallowed
async function shutdownNoErrorHandling(app: ReturnType<typeof fastify>) {
  // Missing: try-catch around close
  await app.close();
}

// ❌ ready() not wrapped in try-catch — ERR_AVVIO_PLUGIN_TIMEOUT unhandled
async function waitForReadyNoErrorHandling(app: ReturnType<typeof fastify>) {
  // Missing: try-catch around ready
  await app.ready();
}

// ❌ register() called but ready/listen not in try-catch — deferred plugin errors unhandled
async function registerPluginNoErrorHandling() {
  const app = fastify();
  app.register(async function myPlugin(instance) {
    // Plugin does async work — if this throws, it will surface at ready/listen
    instance.get('/plugin-route', async () => ({ ok: true }));
  });
  // Missing: try-catch around the awaited ready/listen
  await app.listen({ port: 3000 });
}

// ❌ after() callback ignores err parameter — plugin init error silently swallowed
function registerWithAfterIgnoringError() {
  const app = fastify();
  app.register(async function myPlugin(instance, opts, done) {
    // Plugin might fail
    done();
  });
  // Missing: if (err) throw err in after callback
  app.after(() => {
    // err parameter not checked — plugin initialization error silently lost
    app.get('/after-route', async () => ({ ok: true }));
  });
}
