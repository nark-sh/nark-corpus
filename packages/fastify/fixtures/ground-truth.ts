/**
 * fastify Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Annotations are derived from the fastify contract spec (contract.yaml),
 * NOT from V1 behavior.
 *
 * Key contract rules:
 *   - Route handlers with async calls must be wrapped in try-catch
 *   - listen(), close(), ready() must be awaited in try-catch
 *   - register() plugin errors surface at ready()/listen() time, not at register() call site
 *   - after() callback must check the err parameter
 *   - addHook() async hooks should handle errors to prevent 500s and unhandled rejections
 *
 * Contracted functions (on FastifyInstance from 'fastify'):
 *   - app.get/post/put/delete/patch   postcondition: route-handler-async-error
 *   - app.listen()                    postconditions: listen-no-try-catch, listen-plugin-timeout, listen-container-binding
 *   - app.close()                     postconditions: close-websocket-connection-leak, close-hook-error
 *   - app.ready()                     postconditions: ready-plugin-timeout, ready-plugin-init-error
 *   - app.register()                  postconditions: register-errors-deferred-to-ready, register-plugin-timeout
 *   - app.after()                     postcondition: after-error-parameter-unchecked
 *   - app.addHook()                   postconditions: addhook-async-hook-no-try-catch, addhook-onclose-async-unhandled
 */

import fastify from 'fastify';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Route handler without try-catch — SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

async function startServerMissingRouteErrorHandling() {
  const app = fastify();

  // SHOULD_FIRE: route-handler-async-error — async route handler with no try-catch
  app.get('/user', async (request, reply) => {
    const data = await fetchUserData();
    return { data };
  });

  await app.listen({ port: 3000 });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Route handler with try-catch — SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

async function startServerWithRouteErrorHandling() {
  const app = fastify();

  // SHOULD_NOT_FIRE: route-handler-async-error — has try-catch
  app.get('/user', async (request, reply) => {
    try {
      const data = await fetchUserData();
      return { data };
    } catch (error) {
      reply.code(500).send({ error: 'Failed to fetch user' });
    }
  });

  try {
    await app.listen({ port: 3000 });
  } catch (err) {
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. listen() without try-catch — SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

async function startServerNoListenErrorHandling() {
  const app = fastify();
  app.get('/health', async () => ({ status: 'ok' }));

  // SHOULD_FIRE: listen-port-in-use — EADDRINUSE and plugin timeout unhandled
  await app.listen({ port: 3000 });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. listen() with try-catch — SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

async function startServerWithListenErrorHandling() {
  const app = fastify();
  app.get('/health', async () => ({ status: 'ok' }));

  // SHOULD_NOT_FIRE: listen-port-in-use — properly wrapped
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    console.error('Server failed to start:', err);
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. close() without try-catch — SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

async function shutdownNoErrorHandling(app: ReturnType<typeof fastify>) {
  // SHOULD_FIRE: close-websocket-connection-leak — onClose hook rejections unhandled (also missing close-hook-error)
  await app.close();
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. close() with try-catch — SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

async function shutdownWithErrorHandling(app: ReturnType<typeof fastify>) {
  // SHOULD_NOT_FIRE: close-hook-error — properly wrapped
  try {
    await app.close();
  } catch (err) {
    console.error('Shutdown error:', err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. ready() without try-catch — SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

async function waitForReadyNoErrorHandling(app: ReturnType<typeof fastify>) {
  // SHOULD_FIRE: ready-plugin-timeout — FST_ERR_PLUGIN_TIMEOUT unhandled
  await app.ready();
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. ready() with try-catch — SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

async function waitForReadyWithErrorHandling(app: ReturnType<typeof fastify>) {
  // SHOULD_NOT_FIRE: ready-plugin-timeout — properly wrapped
  try {
    await app.ready();
  } catch (err) {
    console.error('Plugin loading failed:', err);
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. after() ignoring err parameter — SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

function registerPluginWithAfterIgnoringError() {
  const app = fastify();

  app.register(async function myPlugin(instance) {
    instance.get('/plugin-route', async () => ({ ok: true }));
  });

  // SHOULD_FIRE: after-error-parameter-unchecked — err parameter ignored
  app.after(() => {
    app.get('/after-route', async () => ({ ok: true }));
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. after() checking err parameter — SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

function registerPluginWithAfterCheckingError() {
  const app = fastify();

  app.register(async function myPlugin(instance) {
    instance.get('/plugin-route', async () => ({ ok: true }));
  });

  // SHOULD_NOT_FIRE: after-error-parameter-unchecked — err is checked and re-thrown
  app.after((err) => {
    if (err) throw err;
    app.get('/after-route', async () => ({ ok: true }));
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. setErrorHandler() called after server start — programming error
//     (This fires at startup, not runtime — documents the pattern)
// ─────────────────────────────────────────────────────────────────────────────

async function setErrorHandlerAfterStart() {
  const app = fastify();
  await app.listen({ port: 0 });

  // throws: 'Cannot call "setErrorHandler" when fastify instance is already started!'
  // SHOULD_FIRE: seterrorhandler-called-after-start — setErrorHandler after listen()
  app.setErrorHandler((error, request, reply) => {
    reply.status(500).send({ error: error.message });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. setErrorHandler() properly before listen — SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

async function setErrorHandlerBeforeStart() {
  const app = fastify();

  // SHOULD_NOT_FIRE: seterrorhandler-called-after-start — called before listen()
  app.setErrorHandler((error, request, reply) => {
    reply.status(500).send({ error: error.message });
  });

  try {
    await app.listen({ port: 0 });
  } catch (err) {
    console.error('Failed to start:', err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. addContentTypeParser() with missing body size error handling — SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

async function setupWithCustomParserNoErrorHandling() {
  const app = fastify();

  // SHOULD_FIRE: addcontenttype-body-too-large — no setErrorHandler for FST_ERR_CTP_BODY_TOO_LARGE
  app.addContentTypeParser('application/octet-stream', async (request: any, body: any) => {
    return body;
  });

  // also triggers route-handler-async-error since route body has no try-catch
  app.post('/upload', async (request, reply) => {
    const data = await processUpload(request.body);
    return { processed: data };
  });

  await app.listen({ port: 0 });
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. addContentTypeParser() with error handling — SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

async function setupWithCustomParserAndErrorHandling() {
  const app = fastify();

  app.setErrorHandler((error: any, request, reply) => {
    if (error.code === 'FST_ERR_CTP_BODY_TOO_LARGE') {
      reply.code(413).send({ error: 'Request body too large', maxBytes: 1048576 });
    } else if (error.code === 'FST_ERR_CTP_INVALID_MEDIA_TYPE') {
      reply.code(415).send({ error: 'Unsupported content type' });
    } else {
      reply.code(500).send({ error: error.message });
    }
  });

  // SHOULD_NOT_FIRE: addcontenttype-body-too-large / addcontenttype-invalid-media-type — handled
  app.addContentTypeParser('application/octet-stream', async (request: any, body: any) => {
    return body;
  });

  app.post('/upload', async (request, reply) => {
    try {
      const data = await processUpload(request.body);
      return { processed: data };
    } catch (err) {
      reply.code(400).send({ error: 'Processing failed' });
    }
  });

  try {
    await app.listen({ port: 0 });
  } catch (err) {
    console.error('Failed to start:', err);
  }
}

// Helper stubs
async function fetchUserData() {
  return { id: 1, name: 'Alice' };
}

async function processUpload(body: unknown) {
  return body;
}
