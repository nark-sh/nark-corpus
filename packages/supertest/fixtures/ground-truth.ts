/**
 * supertest Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "supertest"):
 *   - request(app)       postconditions: assertion-failure, connection-refused,
 *                                        server-not-closed, async-test-unhandled-rejection
 *   - request.agent(app) postconditions: agent-http2-not-supported, agent-cookie-state-leak,
 *                                        agent-server-not-closed, agent-async-unhandled-rejection
 *
 * Detection path: import('supertest') → request() or request.agent() call →
 *   ThrowingFunctionDetector fires → ContractMatcher checks error handling
 *
 * NOTE: supertest is a test-only library. Its contracts describe test-code pitfalls
 * (swallowed assertion errors, process hangs, cookie leaks) rather than production errors.
 * The scanner fires on patterns where test assertions are unhandled.
 */

import request from 'supertest';
import express from 'express';

// ─────────────────────────────────────────────────────────────────────────────
// 1. request(app) — async test without await (assertion silently swallowed)
// ─────────────────────────────────────────────────────────────────────────────

const app = express();
app.get('/user', (_req, res) => { res.status(200).json({ name: 'john' }); });

export async function testGetUserNoAwait() {
  // SHOULD_FIRE: async-test-unhandled-rejection — request chain not awaited.
  // Assertion failure (if any) is silently swallowed.
  request(app).get('/user').expect(200);
}

export async function testGetUserWithAwait() {
  // SHOULD_NOT_FIRE: chain is awaited — assertion failures will propagate to the test framework.
  await request(app).get('/user').expect(200);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. request(app) — .end() callback style without propagating error
// ─────────────────────────────────────────────────────────────────────────────

export function testEndCallbackNoPropagation(done: (err?: Error) => void) {
  // SHOULD_FIRE: end-callback-error-pattern — err from assertion not passed to done().
  // If .expect(200) fails (e.g. response is 404), the test will time out instead of failing.
  request(app)
    .get('/user')
    .expect(200)
    .end((_err, _res) => {
      // Missing: if (_err) return done(_err);
      done();
    });
}

export function testEndCallbackWithPropagation(done: (err?: Error) => void) {
  // SHOULD_NOT_FIRE: error correctly passed to done() — test fails on assertion error.
  request(app)
    .get('/user')
    .expect(200)
    .end((err, _res) => {
      if (err) return done(err);
      done();
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. request.agent(app) — async test without await (assertion silently swallowed)
// ─────────────────────────────────────────────────────────────────────────────

const agent = request.agent(app);

export async function testAgentGetNoAwait() {
  // SHOULD_FIRE: agent-async-unhandled-rejection — agent request chain not awaited.
  // Assertions silently swallowed even when session/cookie flows fail.
  agent.get('/user').expect(200);
}

export async function testAgentGetWithAwait() {
  // SHOULD_NOT_FIRE: agent chain is awaited — assertion failures propagate correctly.
  await agent.get('/user').expect(200);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. request.agent(app) — cookie state leak (module-level agent shared across tests)
// ─────────────────────────────────────────────────────────────────────────────

// Module-level agent — shared across all tests in this file
// SHOULD_FIRE: agent-cookie-state-leak — if agent is used in test A that sets cookies,
// test B may unexpectedly receive those cookies, causing order-dependent failures.
const sharedAgent = request.agent(app);

export async function testWithSharedAgentLogin() {
  // Logs in — sets auth cookie on sharedAgent
  await sharedAgent.post('/login').send({ user: 'admin' }).expect(200);
}

export async function testWithSharedAgentUnauthenticated() {
  // SHOULD_FIRE: agent-cookie-state-leak — expects unauthenticated response,
  // but sharedAgent carries the cookie from testWithSharedAgentLogin().
  await sharedAgent.get('/protected').expect(401);
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. request.agent(app) — clean pattern: fresh agent per test suite
// ─────────────────────────────────────────────────────────────────────────────

export async function testWithFreshAgent() {
  // SHOULD_NOT_FIRE: fresh agent created per test — no cookie state leaks.
  const freshAgent = request.agent(app);
  await freshAgent.get('/user').expect(200);
}

// ─────────────────────────────────────────────────────────────name-clean-examples
// 6. request() — correct promise usage with .then()
// ─────────────────────────────────────────────────────────────────────────────

export function testGetUserWithThen() {
  // SHOULD_NOT_FIRE: promise returned to test framework — failures propagate.
  return request(app)
    .get('/user')
    .expect(200)
    .then((res) => {
      return res.body;
    });
}
