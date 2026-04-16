/**
 * PROPER error handling for fastify lifecycle methods.
 * These patterns should NOT trigger violations.
 * Demonstrates correct handling for:
 *   - listen() — EADDRINUSE, ERR_AVVIO_PLUGIN_TIMEOUT, container binding
 *   - close() — WebSocket cleanup, hook errors
 *   - ready() — ERR_AVVIO_PLUGIN_TIMEOUT, plugin init errors
 *   - register() — deferred error surfacing via ready/listen
 *   - after() — err parameter checked
 */
import fastify from 'fastify';

// ✅ listen() with full error handling — catches EADDRINUSE and ERR_AVVIO_PLUGIN_TIMEOUT
async function startServerWithErrorHandling() {
  const app = fastify({ pluginTimeout: 30000 });
  app.get('/health', async () => ({ status: 'ok' }));
  try {
    const address = await app.listen({ port: 3000, host: '0.0.0.0' });
    console.log(`Server listening at ${address}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// ✅ close() with error handling — catches hook errors
async function shutdownWithErrorHandling(app: ReturnType<typeof fastify>) {
  try {
    await app.close();
    console.log('Server closed gracefully');
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
}

// ✅ ready() with error handling — catches ERR_AVVIO_PLUGIN_TIMEOUT and plugin init errors
async function waitForReadyWithErrorHandling(app: ReturnType<typeof fastify>) {
  try {
    await app.ready();
    console.log('All plugins loaded');
  } catch (err) {
    console.error('Plugin initialization failed:', err);
    throw err;
  }
}

// ✅ register() + listen() both in try-catch — deferred errors are caught
async function registerPluginWithErrorHandling() {
  const app = fastify();
  app.register(async function myPlugin(instance) {
    instance.get('/plugin-route', async () => ({ ok: true }));
  });
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    // Catches both EADDRINUSE and any ERR_AVVIO_PLUGIN_TIMEOUT from registered plugins
    app.log.error(err);
    process.exit(1);
  }
}

// ✅ after() callback checks err parameter — plugin init errors propagate
function registerWithAfterCheckingError() {
  const app = fastify();
  app.register(async function myPlugin(instance, opts, done) {
    done();
  });
  app.after((err) => {
    if (err) throw err; // Re-throw so it propagates to ready()/listen()
    app.get('/after-route', async () => ({ ok: true }));
  });
  return app;
}

// ✅ WebSocket cleanup before close() — prevents connection leak hanging shutdown
async function shutdownWithWebSocketCleanup(
  app: ReturnType<typeof fastify>,
  wsClients: Set<{ terminate(): void }>
) {
  // Explicitly terminate all WebSocket connections before calling close()
  for (const client of wsClients) {
    client.terminate();
  }
  try {
    await app.close();
  } catch (err) {
    console.error('Shutdown error:', err);
  }
}
