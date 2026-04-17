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
 *   - superagent.get().pipe()  postconditions: pipe-errors-not-promise-rejections, pipe-cannot-be-mixed-with-promise
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

// ─────────────────────────────────────────────────────────────────────────────
// 6. superagent.get().pipe() — streaming response without error event listener
//    postconditions: pipe-errors-not-promise-rejections, pipe-cannot-be-mixed-with-promise
//
//    Key insight: pipe() bypasses the Promise chain entirely. try-catch and await
//    provide NO protection. Errors are emitted as 'error' events on the Request.
//    If no listener is registered → uncaught exception → process may crash.
// ─────────────────────────────────────────────────────────────────────────────

import { createWriteStream } from 'fs';

// @expect-violation: pipe-errors-not-promise-rejections
export function pipeWithoutErrorListener(url: string, destPath: string) {
  // SHOULD_FIRE: pipe-errors-not-promise-rejections
  // No 'error' event listener on the Request. Network failures and HTTP errors will
  // emit 'error' on the Request but since no listener is registered, Node.js throws
  // an uncaught exception. The try-catch here is IRRELEVANT — pipe() doesn't reject.
  const dest = createWriteStream(destPath);
  try {
    superagent.get(url).pipe(dest); // ❌ No req.on('error', handler) — errors are silently lost
  } catch (err) {
    // This catch block will NEVER receive network errors from pipe() — they are events.
    console.error('This will never run for network errors:', err);
  }
}

// @expect-violation: pipe-errors-not-promise-rejections
export async function pipeWithAwaitNoCatch(url: string, destPath: string) {
  // SHOULD_FIRE: pipe-errors-not-promise-rejections
  // Wrapping in async and using try-catch gives developers false confidence.
  // pipe() still bypasses the Promise chain — errors are still events, not rejections.
  const dest = createWriteStream(destPath);
  try {
    // ❌ await here is incorrect — pipe() returns the dest stream, not a Promise.
    // Even with await, network errors on the Request are not caught here.
    await superagent.get(url).pipe(dest);
  } catch (err) {
    console.error('Network errors from pipe() will not be caught here:', err);
  }
}

// @expect-clean
export function pipeWithErrorListener(url: string, destPath: string) {
  // SHOULD_NOT_FIRE: proper error handling for pipe() — 'error' listener on Request
  // and 'error' listener on destination stream for decompression errors.
  const dest = createWriteStream(destPath);
  const req = superagent.get(url);

  // ✅ Register 'error' listener BEFORE calling pipe()
  req.on('error', (err) => {
    console.error('Request error during pipe:', err.message);
    dest.destroy(err); // Clean up dest stream on request error
  });

  // ✅ Register 'error' on dest for decompression errors
  dest.on('error', (err) => {
    console.error('Destination stream error (may be decompression):', err);
  });

  req.pipe(dest);
}

// @expect-violation: pipe-cannot-be-mixed-with-promise
export async function pipeAfterAwait(url: string, destPath: string) {
  // SHOULD_FIRE: pipe-cannot-be-mixed-with-promise
  // ❌ WRONG: awaiting the request (via then() internally) and then trying to pipe
  // the response. res.pipe() will throw synchronously: "end() has already been called"
  const res = await superagent.get(url); // This calls end() internally
  const dest = createWriteStream(destPath);
  // @ts-ignore — res is Response, not Request, but this mistake happens at runtime
  res.pipe(dest); // ❌ Throws: "end() has already been called, so it's too late to start piping"
}

// @expect-clean
export async function correctPipePattern(url: string, destPath: string) {
  // SHOULD_NOT_FIRE: using pipe correctly — no mixing with promises, proper error handling
  return new Promise<void>((resolve, reject) => {
    const dest = createWriteStream(destPath);
    const req = superagent.get(url);

    req.on('error', reject); // ✅ Handle request errors
    dest.on('error', reject); // ✅ Handle stream errors (decompression, write errors)
    dest.on('finish', resolve); // ✅ Resolve when streaming is complete

    req.pipe(dest); // ✅ Start streaming
  });
}
