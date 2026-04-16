/**
 * @hapi/hapi Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Annotations are derived from the contract spec (contract.yaml),
 * NOT from V1 behavior.
 *
 * Key contract rules:
 *   - server.start()          async — throws on port conflict, plugin error, invalid config
 *   - server.stop()           async — throws if wrong lifecycle phase or hook error
 *   - server.initialize()     async — throws if plugins still registering or wrong phase
 *   - server.register()       async — throws on duplicate plugin or version mismatch
 *   - server.auth.test()      async — throws on unknown strategy or auth failure
 *   - server.auth.verify()    async — throws on expired/revoked credentials
 *   - server.route()          sync  — route handler async errors contract (already in V1)
 *
 * Coverage:
 *   - Section 1: server.start() violations
 *   - Section 2: server.stop() violations
 *   - Section 3: server.initialize() violations
 *   - Section 4: server.register() violations
 *   - Section 5: server.auth.test() and server.auth.verify() violations
 *   - Section 6: Clean (SHOULD_NOT_FIRE) cases for all new functions
 *
 * NOTE: New postconditions (initialize-*, stop-*, register-*, auth-*) do not yet
 * have scanner detection rules. Tests for those will show "no detector" until
 * bc-scanner-upgrade implements the rules. Per Phase 4 rules, tests must compile
 * and not crash — the SHOULD_FIRE annotations remain as spec documentation.
 */

import Hapi from '@hapi/hapi';

// ─────────────────────────────────────────────────────────────────────────────
// 1. server.start() — SHOULD_FIRE (already contracted — regression tests)
// ─────────────────────────────────────────────────────────────────────────────

export async function startNoCatch() {
  const server = Hapi.server({ port: 3000 });
  // SHOULD_FIRE: start-error — server.start() throws on port conflict or plugin error, no try-catch
  await server.start();
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. server.stop() — SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function stopNoCatch(server: Hapi.Server) {
  // SHOULD_FIRE: stop-lifecycle-hook-error — server.stop() awaits onPreStop/onPostStop hooks
  // which can throw. No try-catch means the rejection propagates unhandled.
  await server.stop();
}

export async function stopInSignalHandlerNoCatch(server: Hapi.Server) {
  // SHOULD_FIRE: stop-invalid-phase — stop() called without phase guard or try-catch
  process.on('SIGTERM', async () => {
    // SHOULD_FIRE: stop-lifecycle-hook-error — unhandled rejection in SIGTERM handler
    await server.stop({ timeout: 10000 });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. server.initialize() — SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function initializeNoCatch() {
  const server = Hapi.server({ port: 3000 });
  // SHOULD_FIRE: initialize-cache-start-error — initialize() starts all caches; if Redis/Memcached
  // is unavailable, cache.client.start() rejects and sets server phase to 'invalid'
  // SHOULD_FIRE: initialize-plugin-not-registered — if called before register() completes
  await server.initialize();
}

export async function initializeThenStartNoCatch() {
  const server = Hapi.server({ port: 3000 });
  // SHOULD_FIRE: initialize-cache-start-error — no try-catch around initialize()
  await server.initialize();
  // SHOULD_FIRE: start-error — no try-catch around start() either
  await server.start();
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. server.register() — SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

const fakePlugin = {
  name: 'my-plugin',
  register: async (server: Hapi.Server) => {
    server.route({
      method: 'GET',
      path: '/plugin',
      handler: () => ({ ok: true }),
    });
  },
};

export async function registerNoCatch() {
  const server = Hapi.server({ port: 3000 });
  // SHOULD_FIRE: register-plugin-init-error — plugin register() can throw; no try-catch
  // SHOULD_FIRE: register-duplicate-plugin — second call without once: true throws
  await server.register(fakePlugin);
}

export async function registerTwiceNoCatch() {
  const server = Hapi.server({ port: 3000 });
  // SHOULD_FIRE: register-duplicate-plugin — registering the same plugin twice without
  // once: true throws 'Plugin my-plugin already registered'
  await server.register(fakePlugin);
  await server.register(fakePlugin);
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. server.auth.test() and server.auth.verify() — SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function authTestNoCatch(server: Hapi.Server, request: Hapi.Request) {
  // SHOULD_FIRE: auth-test-authentication-failure — auth.test() throws Boom.unauthorized
  // if strategy returns unauthenticated result; no try-catch
  // SHOULD_FIRE: auth-test-unknown-strategy — throws AssertionError if strategy name is wrong
  const auth = await server.auth.test('jwt', request);
  return auth;
}

export async function authVerifyNoCatch(server: Hapi.Server, request: Hapi.Request) {
  // SHOULD_FIRE: auth-verify-credentials-invalid — verify() calls strategy.methods.verify()
  // which throws if credentials expired or revoked; no try-catch
  await server.auth.verify(request);
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Clean cases — SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

// SHOULD_NOT_FIRE: start wrapped in try-catch
export async function startWithCatch() {
  const server = Hapi.server({ port: 3000 });
  try {
    await server.start();
  } catch (error) {
    console.error('Server start failed:', error);
    process.exit(1);
  }
}

// SHOULD_NOT_FIRE: stop wrapped in try-catch
export async function stopWithCatch(server: Hapi.Server) {
  try {
    await server.stop({ timeout: 10000 });
  } catch (error) {
    console.error('Server stop failed:', error);
  }
}

// SHOULD_NOT_FIRE: initialize wrapped in try-catch
export async function initializeWithCatch() {
  const server = Hapi.server({ port: 3000 });
  try {
    await server.initialize();
  } catch (error) {
    console.error('Server initialization failed:', error);
    process.exit(1);
  }
}

// SHOULD_NOT_FIRE: register wrapped in try-catch
export async function registerWithCatch() {
  const server = Hapi.server({ port: 3000 });
  try {
    await server.register(fakePlugin);
  } catch (error) {
    console.error('Plugin registration failed:', error);
    process.exit(1);
  }
}

// SHOULD_NOT_FIRE: auth.test wrapped in try-catch
export async function authTestWithCatch(server: Hapi.Server, request: Hapi.Request) {
  try {
    const auth = await server.auth.test('jwt', request);
    return auth;
  } catch (error) {
    console.error('Authentication test failed:', error);
    return null;
  }
}

// SHOULD_NOT_FIRE: auth.verify wrapped in try-catch
export async function authVerifyWithCatch(server: Hapi.Server, request: Hapi.Request) {
  try {
    await server.auth.verify(request);
  } catch (error) {
    console.error('Credential verification failed:', error);
    throw error;
  }
}

// SHOULD_NOT_FIRE: full lifecycle with proper error handling
export async function fullLifecycleWithCatch() {
  const server = Hapi.server({ port: 3000, host: 'localhost' });

  try {
    await server.register(fakePlugin);
  } catch (error) {
    console.error('Plugin registration failed:', error);
    process.exit(1);
  }

  server.route({
    method: 'GET',
    path: '/health',
    handler: async (request, h) => {
      try {
        return { status: 'ok' };
      } catch (error) {
        throw error;
      }
    },
  });

  try {
    await server.start();
    console.log('Server started on', server.info.uri);
  } catch (error) {
    console.error('Server start failed:', error);
    process.exit(1);
  }

  process.on('SIGTERM', async () => {
    try {
      await server.stop({ timeout: 10000 });
      console.log('Server stopped');
    } catch (error) {
      console.error('Server stop error:', error);
      process.exit(1);
    }
  });
}
