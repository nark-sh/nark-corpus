/**
 * ground-truth.ts — nock behavioral contract test fixtures
 *
 * Tests for postconditions added in the 2026-04-18 depth pass:
 *   - load-file-not-found
 *   - load-invalid-json
 *   - loaddefs-file-not-found
 *   - scope-done-unused-mocks-throw
 *   - scope-done-swallowed-in-async-callback
 *   - back-fixtures-not-set
 *   - back-unknown-mode
 */

import nock from 'nock';
import * as path from 'path';

// ─── nock.load() ────────────────────────────────────────────────────────────

// @expect-violation: load-file-not-found
// @expect-violation: load-invalid-json
function loadNockFixtureNoErrorHandling() {
  // ❌ No try-catch: if the fixture file is missing or has invalid JSON,
  // this crashes the test setup with ENOENT or SyntaxError respectively.
  const scopes = nock.load(path.join(__dirname, 'fixtures', 'recorded.json'));
  return scopes;
}

// @expect-clean
function loadNockFixtureWithErrorHandling() {
  try {
    const scopes = nock.load(path.join(__dirname, 'fixtures', 'recorded.json'));
    return scopes;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error('Fixture file not found — run with NOCK_BACK_MODE=record first');
    }
    if (err instanceof SyntaxError) {
      throw new Error('Fixture file contains invalid JSON — delete and re-record');
    }
    throw err;
  }
}

// ─── nock.loadDefs() ────────────────────────────────────────────────────────

// @expect-violation: loaddefs-file-not-found
function loadDefsNoErrorHandling() {
  // ❌ No try-catch: throws ENOENT if fixture path is wrong.
  const defs = nock.loadDefs(path.join(__dirname, 'fixtures', 'missing.json'));
  return defs;
}

// @expect-clean
function loadDefsWithErrorHandling() {
  try {
    const defs = nock.loadDefs(path.join(__dirname, 'fixtures', 'recorded.json'));
    return defs;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error('Fixture file not found');
    }
    throw err;
  }
}

// ─── Scope.done() ───────────────────────────────────────────────────────────

// @expect-violation: scope-done-unused-mocks-throw
async function callScopeDoneWithoutAwaitingRequest() {
  const scope = nock('https://api.example.com').get('/data').reply(200, { ok: true });
  // ❌ Code under test never makes the HTTP request — scope.done() will throw AssertionError
  // "Mocks not yet satisfied: GET https://api.example.com/data"
  scope.done();
}

// @expect-clean
async function callScopeDoneAfterRequest() {
  const scope = nock('https://api.example.com').get('/data').reply(200, { ok: true });
  await fetch('https://api.example.com/data');
  // ✅ All interceptors consumed — done() does not throw
  scope.done();
  nock.cleanAll();
}

// @expect-violation: scope-done-swallowed-in-async-callback
function callScopeDoneInsideAsyncCallback(done: () => void) {
  const scope = nock('https://api.example.com').get('/data').reply(200, {});
  // ❌ AssertionError from scope.done() inside setTimeout is an unhandled exception,
  // not a test failure — test may pass even if the mock was never used.
  setTimeout(() => {
    scope.done(); // throws outside test framework awareness
    done();
  }, 100);
}

// @expect-clean
async function callScopeDoneSynchronously() {
  const scope = nock('https://api.example.com').get('/data').reply(200, {});
  await fetch('https://api.example.com/data');
  // ✅ Synchronous call at end of async test — AssertionError propagates correctly
  scope.done();
}

// ─── nock.back() ────────────────────────────────────────────────────────────

// @expect-violation: back-fixtures-not-set
async function useNockBackWithoutSettingFixtures() {
  // ❌ nock.back.fixtures is null by default. Throws synchronously:
  // Error: "Back requires nock.back.fixtures to be set"
  const { nockDone } = await nock.back('my-fixture.json');
  nockDone();
}

// @expect-clean
async function useNockBackWithFixturesSet() {
  nock.back.fixtures = path.join(__dirname, '__nock-fixtures__');
  nock.back.setMode('lockdown');
  try {
    const { nockDone, context } = await nock.back('my-fixture.json');
    // ... code under test ...
    nockDone();
  } catch (err) {
    if (err instanceof Error && err.message.includes('Back requires')) {
      throw new Error('nock.back.fixtures must be set in beforeAll');
    }
    throw err;
  }
}

// @expect-violation: back-unknown-mode
function setUnknownNockBackMode() {
  // ❌ Throws: Error — "Unknown mode: replay"
  // Valid modes are: 'wild' | 'dryrun' | 'record' | 'update' | 'lockdown'
  nock.back.setMode('replay' as any);
}

// @expect-clean
function setKnownNockBackMode() {
  // ✅ One of the five valid BackMode strings
  const mode = process.env.NOCK_BACK_MODE || 'lockdown';
  const validModes = ['wild', 'dryrun', 'record', 'update', 'lockdown'];
  if (!validModes.includes(mode)) {
    throw new Error(`Invalid NOCK_BACK_MODE: ${mode}. Must be one of: ${validModes.join(', ')}`);
  }
  nock.back.setMode(mode as 'wild' | 'dryrun' | 'record' | 'update' | 'lockdown');
}

// ─── nock.define() ──────────────────────────────────────────────────────────
// Postconditions added in the 2026-06-24 deepen pass.

// SHOULD_FIRE: define-method-required
function defineWithoutMethodNoErrorHandling() {
  // No try-catch: define() throws "Method is required" if any def has no method.
  const defs = [{ scope: 'https://api.example.com', path: '/data', status: 200 } as any];
  return nock.define(defs);
}

// @expect-clean
function defineWithMethodValidated() {
  const defs = [{ scope: 'https://api.example.com', method: 'GET', path: '/data', status: 200 }];
  try {
    return nock.define(defs);
  } catch (err) {
    nock.cleanAll();
    if (err instanceof Error && err.message === 'Method is required') {
      throw new Error('Fixture has missing method field — re-record fixture');
    }
    throw err;
  }
}

// SHOULD_FIRE: define-reply-not-numeric
function defineWithNonNumericReplyNoErrorHandling() {
  // No try-catch: define() throws "`reply`, when present, must be a numeric string"
  const defs = [{ scope: 'https://api.example.com', method: 'GET', path: '/data', reply: 'OK' } as any];
  return nock.define(defs);
}

// SHOULD_FIRE: define-mismatched-port
function defineWithMismatchedPortNoErrorHandling() {
  // No try-catch: define() throws "Mismatched port numbers in scope and port properties..."
  const defs = [
    { scope: 'https://api.example.com:8080', method: 'GET', path: '/data', port: 9090, status: 200 } as any,
  ];
  return nock.define(defs);
}

// @expect-clean
function defineWithErrorHandling() {
  const defs = [{ scope: 'https://api.example.com', method: 'GET', path: '/data', status: 200 }];
  try {
    return nock.define(defs);
  } catch (err) {
    nock.cleanAll();
    if (err instanceof Error) {
      throw new Error(`nock.define failed: ${err.message}`);
    }
    throw err;
  }
}

// ─── nock.recorder.rec() ────────────────────────────────────────────────────
// Postcondition added in the 2026-06-24 deepen pass.

// SHOULD_FIRE: rec-already-in-progress
function startRecordingTwiceNoErrorHandling() {
  nock.recorder.rec({ dont_print: true, output_objects: true });
  // No try-catch: second call throws "Nock recording already in progress"
  nock.recorder.rec({ dont_print: true, output_objects: true });
}

// @expect-clean
function startRecordingWithCleanupBetween() {
  nock.recorder.rec({ dont_print: true, output_objects: true });
  // Capture output, then tear down before starting again
  const captured = nock.recorder.play();
  nock.restore();
  nock.recorder.clear();
  try {
    nock.recorder.rec({ dont_print: true, output_objects: true });
  } catch (err) {
    if (err instanceof Error && err.message.includes('already in progress')) {
      throw new Error('recorder.rec() called while previous session still active — call nock.restore() + recorder.clear() first');
    }
    throw err;
  }
  return captured;
}
