/**
 * undici Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "undici"):
 *   - request()       postcondition: network-error-handling
 *   - fetch()         postcondition: network-error-handling
 *   - stream()        postcondition: stream-network-error, stream-factory-invalid-return
 *   - connect()       postcondition: connect-network-error
 *   - upgrade()       postcondition: upgrade-network-error
 *   - response.json() postcondition: response-json-parse-error, response-ok-not-checked
 *
 * Detection path: request/fetch/stream/connect/upgrade imported from undici →
 *   ThrowingFunctionDetector fires direct call →
 *   ContractMatcher checks try-catch → postcondition fires
 */

import { request, fetch, stream, connect, upgrade } from 'undici';
import type { Writable } from 'node:stream';

// ─────────────────────────────────────────────────────────────────────────────
// 1. request() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function requestNoCatch(url: string) {
  // SHOULD_FIRE: network-error-handling — request() rejects on connection errors. No try-catch.
  const { statusCode, body } = await request(url);
  return statusCode;
}

export async function requestWithCatch(url: string) {
  try {
    // SHOULD_NOT_FIRE: request() inside try-catch satisfies error handling
    const { statusCode, body } = await request(url);
    return statusCode;
  } catch (err) {
    console.error('Request failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. fetch() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchNoCatch(url: string) {
  // SHOULD_FIRE: network-error-handling — fetch() rejects on connection errors. No try-catch.
  const response = await fetch(url);
  return response.status;
}

export async function fetchWithCatch(url: string) {
  try {
    // SHOULD_NOT_FIRE: fetch() inside try-catch satisfies error handling
    const response = await fetch(url);
    return response.status;
  } catch (err) {
    console.error('Fetch failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. stream() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function streamNoCatch(url: string, dest: Writable) {
  // SHOULD_FIRE: stream-network-error — stream() rejects on network errors. No try-catch.
  const { opaque } = await stream(url, { opaque: dest }, ({ opaque: _dest }) => _dest as Writable);
  return opaque;
}

export async function streamWithCatch(url: string, dest: Writable) {
  try {
    // SHOULD_NOT_FIRE: stream() inside try-catch satisfies error handling
    const { opaque } = await stream(url, { opaque: dest }, ({ opaque: _dest }) => _dest as Writable);
    return opaque;
  } catch (err) {
    console.error('Stream failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. connect() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function connectNoCatch(url: string) {
  // SHOULD_FIRE: connect-network-error — connect() rejects on timeout/proxy failure. No try-catch.
  const { socket } = await connect(url);
  return socket;
}

export async function connectWithCatch(url: string) {
  try {
    // SHOULD_NOT_FIRE: connect() inside try-catch satisfies error handling
    const { socket } = await connect(url);
    return socket;
  } catch (err) {
    console.error('Connect failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. upgrade() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function upgradeNoCatch(url: string) {
  // SHOULD_FIRE: upgrade-network-error — upgrade() rejects on network/server errors. No try-catch.
  const { socket, headers } = await upgrade(url, { upgrade: 'websocket' });
  return socket;
}

export async function upgradeWithCatch(url: string) {
  try {
    // SHOULD_NOT_FIRE: upgrade() inside try-catch satisfies error handling
    const { socket, headers } = await upgrade(url, { upgrade: 'websocket' });
    return socket;
  } catch (err) {
    console.error('Upgrade failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. fetch() + response.json() — response.ok not checked
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchJsonNoOkCheck(url: string) {
  try {
    // SHOULD_FIRE: response-ok-not-checked — fetch() inside try-catch but response.ok not checked
    // before calling response.json(). On 4xx/5xx with HTML body, json() throws SyntaxError.
    const response = await fetch(url);
    const data = await response.json(); // may throw SyntaxError on error pages
    return data;
  } catch (err) {
    console.error('Fetch failed:', err);
    throw err;
  }
}

export async function fetchJsonWithOkCheck(url: string) {
  try {
    // SHOULD_NOT_FIRE: fetch() with response.ok check before response.json()
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Fetch failed:', err);
    throw err;
  }
}
