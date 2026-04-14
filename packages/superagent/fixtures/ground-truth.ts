/**
 * superagent Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "superagent"):
 *   - superagent.get()   postconditions: network-error-handling, timeout-error-identifiable, max-response-size-exceeded
 *   - superagent.post()  postconditions: network-error-handling, timeout-error-identifiable
 *   - superagent.agent() postconditions: agent-request-network-error, agent-session-auth-failure
 *
 * Detection path: direct import → ThrowingFunctionDetector fires get()/post()/etc. →
 *   ContractMatcher checks try-catch → postcondition fires
 */

import superagent from 'superagent';

// ─────────────────────────────────────────────────────────────────────────────
// 1. superagent.get() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function getNoCatch(url: string) {
  // SHOULD_FIRE: network-error-handling — superagent.get() throws on network errors. No try-catch.
  const res = await superagent.get(url);
  return res.body;
}

export async function getWithCatch(url: string) {
  try {
    // SHOULD_NOT_FIRE: superagent.get() inside try-catch satisfies error handling
    const res = await superagent.get(url);
    return res.body;
  } catch (err) {
    console.error('GET failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. superagent.post() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function postNoCatch(url: string, data: unknown) {
  // SHOULD_FIRE: network-error-handling — superagent.post() throws on network errors. No try-catch.
  const res = await superagent.post(url).send(data);
  return res.body;
}

export async function postWithCatch(url: string, data: unknown) {
  try {
    // SHOULD_NOT_FIRE: superagent.post() inside try-catch satisfies error handling
    const res = await superagent.post(url).send(data);
    return res.body;
  } catch (err) {
    console.error('POST failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Timeout with .timeout() — no try-catch
//    postcondition: timeout-error-identifiable
//    err.code='ETIME' (deadline) or 'ETIMEDOUT' (response timeout), err.timeout=<ms>
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: timeout-error-identifiable
export async function getWithTimeoutNoCatch(url: string) {
  // No try-catch to handle the timeout-specific error.
  // SHOULD_FIRE: timeout-error-identifiable — .timeout() can throw err with code='ETIME'.
  const res = await superagent.get(url).timeout({ deadline: 5000, response: 3000 });
  return res.body;
}

// @expect-clean
export async function getWithTimeoutAndCatch(url: string) {
  try {
    // SHOULD_NOT_FIRE: inside try-catch
    const res = await superagent.get(url).timeout({ deadline: 5000, response: 3000 });
    return res.body;
  } catch (err: any) {
    if (err.timeout) {
      // Timeout-specific handling — check err.code for 'ETIME' (deadline) vs 'ETIMEDOUT' (response)
      console.error(`Request timed out (code: ${err.code})`);
      throw new Error('Service timeout');
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Large response without error handling
//    postcondition: max-response-size-exceeded
//    err.code='ETOOLARGE', triggered when buffered response > maxResponseSize (default 200MB)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: max-response-size-exceeded
export async function getLargeResponseNoCatch(url: string) {
  // SHOULD_FIRE: max-response-size-exceeded — no try-catch to handle ETOOLARGE error
  const res = await superagent.get(url).maxResponseSize(1024 * 1024); // 1MB limit
  return res.body;
}

// @expect-clean
export async function getLargeResponseWithCatch(url: string) {
  try {
    // SHOULD_NOT_FIRE: inside try-catch
    const res = await superagent.get(url).maxResponseSize(1024 * 1024);
    return res.body;
  } catch (err: any) {
    if (err.code === 'ETOOLARGE') {
      // Response exceeded maxResponseSize — use streaming instead
      throw new Error('Response too large; use streaming endpoint');
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. superagent.agent() — stateful session agent without try-catch
//    postconditions: agent-request-network-error, agent-session-auth-failure
// ─────────────────────────────────────────────────────────────────────────────

const agent = superagent.agent();

// @expect-violation: agent-request-network-error
export async function agentGetNoCatch(url: string) {
  // Agent carries session cookies so errors may indicate network OR expired session.
  // SHOULD_FIRE: agent-request-network-error — agent.get() without try-catch.
  const res = await agent.get(url);
  return res.body;
}

// @expect-clean
export async function agentGetWithCatch(url: string) {
  try {
    // SHOULD_NOT_FIRE: inside try-catch
    const res = await agent.get(url);
    return res.body;
  } catch (err: any) {
    if (err.status === 401 || err.status === 403) {
      // agent-session-auth-failure: session cookie expired, must re-authenticate
      throw new Error('Session expired; re-authentication required');
    }
    throw err;
  }
}

// @expect-violation: agent-request-network-error
export async function agentPostNoCatch(url: string, data: unknown) {
  // SHOULD_FIRE: agent-request-network-error — agent.post() without try-catch
  const res = await agent.post(url).send(data);
  return res.body;
}
