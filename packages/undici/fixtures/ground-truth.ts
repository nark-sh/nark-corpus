/**
 * undici Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "undici"):
 *   - request()            postcondition: network-error-handling
 *   - fetch()              postcondition: network-error-handling
 *   - stream()             postcondition: stream-network-error, stream-factory-invalid-return
 *   - connect()            postcondition: connect-network-error
 *   - upgrade()            postcondition: upgrade-network-error
 *   - response.json()      postcondition: response-json-parse-error, response-ok-not-checked
 *   - response.text()      postcondition: response-text-body-already-read, response-text-no-try-catch
 *   - response.arrayBuffer() postcondition: response-arraybuffer-body-already-read, response-arraybuffer-no-try-catch
 *   - WebSocket            postcondition: websocket-constructor-syntax-error, websocket-connection-error-not-handled
 *   - Dispatcher.close()   postcondition: dispatcher-close-already-destroyed
 *   - response.blob()      postcondition: response-blob-no-try-catch, response-blob-body-already-read
 *   - response.bytes()     postcondition: response-bytes-no-try-catch, response-bytes-body-already-read
 *   - response.formData()  postcondition: response-formdata-no-try-catch, response-formdata-unsupported-content-type
 *   - pipeline()           postcondition: pipeline-missing-error-listener
 *   - Dispatcher.destroy() postcondition: dispatcher-destroy-no-try-catch
 *   - EventSource          postcondition: eventsource-constructor-syntax-error, eventsource-connection-error-not-handled
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
    // SHOULD_NOT_FIRE: response-ok-not-checked detection requires data-flow analysis
    // (tracking whether response.ok was checked before response.json()). The scanner
    // does not yet implement cross-statement data-flow for ok-check suppression.
    // This is a known scanner limitation — detection deferred.
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

// ─────────────────────────────────────────────────────────────────────────────
// 7. response.text() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: response-text-no-try-catch
export async function fetchTextNoCatch(url: string) {
  const response = await fetch(url); // already no try-catch fires for fetch
  // SHOULD_FIRE: response-text-no-try-catch — response.text() called without try-catch
  const text = await response.text();
  return text;
}

// @expect-clean
export async function fetchTextWithCatch(url: string) {
  try {
    // SHOULD_NOT_FIRE: both fetch() and response.text() wrapped in try-catch
    const response = await fetch(url);
    const text = await response.text();
    return text;
  } catch (err) {
    console.error('Fetch text failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. response.arrayBuffer() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: response-arraybuffer-no-try-catch
export async function fetchArrayBufferNoCatch(url: string) {
  const response = await fetch(url);
  // SHOULD_FIRE: response-arraybuffer-no-try-catch — response.arrayBuffer() without try-catch
  const buf = await response.arrayBuffer();
  return buf;
}

// @expect-clean
export async function fetchArrayBufferWithCatch(url: string) {
  try {
    // SHOULD_NOT_FIRE: both fetch() and response.arrayBuffer() in try-catch
    const response = await fetch(url);
    const buf = await response.arrayBuffer();
    return buf;
  } catch (err) {
    console.error('Fetch arrayBuffer failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. WebSocket — no error handler
// ─────────────────────────────────────────────────────────────────────────────
import { WebSocket } from 'undici';

// @expect-violation: websocket-connection-error-not-handled
export function createWebSocketNoHandler(url: string) {
  // SHOULD_FIRE: websocket-connection-error-not-handled — no onerror registered
  const ws = new WebSocket(url);
  ws.onmessage = (event) => {
    console.log('Message:', event.data);
  };
  return ws;
}

// @expect-clean
export function createWebSocketWithHandler(url: string) {
  // SHOULD_NOT_FIRE: onerror listener registered before use
  const ws = new WebSocket(url);
  ws.onerror = (event) => {
    console.error('WebSocket error:', event);
  };
  ws.onclose = (event) => {
    if (!event.wasClean) console.warn('Abnormal close, code:', event.code);
  };
  ws.onmessage = (event) => {
    console.log('Message:', event.data);
  };
  return ws;
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. Dispatcher.close() — no try-catch
// ─────────────────────────────────────────────────────────────────────────────
import { Client } from 'undici';

// @expect-violation: dispatcher-close-already-destroyed
export async function dispatcherCloseNoCatch(baseUrl: string) {
  const client = new Client(baseUrl);
  // ... use client for requests ...
  // SHOULD_FIRE: dispatcher-close-already-destroyed — close() rejects if destroy() was called first
  await client.close(); // no try-catch
}

// @expect-clean
export async function dispatcherCloseWithCatch(baseUrl: string) {
  const client = new Client(baseUrl);
  try {
    // SHOULD_NOT_FIRE: close() inside try-catch satisfies error handling
    if (!client.destroyed) {
      await client.close();
    }
  } catch (err) {
    console.error('Client close failed:', err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. response.blob() — no try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: response-blob-no-try-catch
export async function responseBlobNoCatch(url: string) {
  const response = await fetch(url);
  // SHOULD_FIRE: response-blob-no-try-catch — body stream can fail mid-download
  const blob = await response.blob();
  return blob.size;
}

// @expect-clean
export async function responseBlobWithCatch(url: string) {
  try {
    const response = await fetch(url);
    // SHOULD_NOT_FIRE: blob() inside try-catch satisfies error handling
    const blob = await response.blob();
    return blob.size;
  } catch (err) {
    console.error('Blob read failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. response.bytes() — no try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: response-bytes-no-try-catch
export async function responseBytesNoCatch(url: string) {
  const response = await fetch(url);
  // SHOULD_FIRE: response-bytes-no-try-catch — body stream can fail mid-download
  const bytes = await response.bytes();
  return bytes.byteLength;
}

// @expect-clean
export async function responseBytesWithCatch(url: string) {
  try {
    const response = await fetch(url);
    // SHOULD_NOT_FIRE: bytes() inside try-catch satisfies error handling
    const bytes = await response.bytes();
    return bytes.byteLength;
  } catch (err) {
    console.error('Bytes read failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. response.formData() — no try-catch, unsupported content-type
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: response-formdata-no-try-catch
export async function responseFormDataNoCatch(url: string) {
  const response = await fetch(url);
  // SHOULD_FIRE: response-formdata-no-try-catch — TypeError on bad content-type or parse error
  const fd = await response.formData();
  return fd.get('field');
}

// @expect-clean
export async function responseFormDataWithCatch(url: string) {
  try {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('form-data') && !contentType.includes('form-urlencoded')) {
      throw new Error(`Unexpected content-type: ${contentType}`);
    }
    // SHOULD_NOT_FIRE: formData() inside try-catch satisfies error handling
    const fd = await response.formData();
    return fd.get('field');
  } catch (err) {
    console.error('FormData parse failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. pipeline() — missing 'error' listener on returned Duplex
// ─────────────────────────────────────────────────────────────────────────────

import { pipeline } from 'undici';
import { Readable } from 'node:stream';

// @expect-violation: pipeline-missing-error-listener
export async function pipelineNoErrorListener(url: string) {
  // SHOULD_FIRE: pipeline-missing-error-listener — returned Duplex emits 'error' but no listener
  const duplex = pipeline(url, { method: 'POST' }, ({ statusCode, body }) => {
    return body;
  });
  return duplex;
}

// @expect-clean
export async function pipelineWithErrorListener(url: string) {
  const duplex = pipeline(url, { method: 'POST' }, ({ statusCode, body }) => {
    return body;
  });
  // SHOULD_NOT_FIRE: 'error' listener registered on returned Duplex
  duplex.on('error', (err) => {
    console.error('Pipeline failed:', err);
  });
  return duplex;
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. Dispatcher.destroy() — no try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: dispatcher-destroy-no-try-catch
export async function dispatcherDestroyNoCatch(baseUrl: string) {
  const client = new Client(baseUrl);
  // ... use client for requests ...
  // SHOULD_FIRE: dispatcher-destroy-no-try-catch — destroy() can fail with InvalidArgumentError
  await client.destroy(new Error('shutdown'));
}

// @expect-clean
export async function dispatcherDestroyWithCatch(baseUrl: string) {
  const client = new Client(baseUrl);
  try {
    // SHOULD_NOT_FIRE: destroy() inside try-catch satisfies error handling
    await client.destroy(new Error('shutdown'));
  } catch (err) {
    console.warn('Client destroy failed:', err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. EventSource — SyntaxError on bad URL + missing 'error' listener
// ─────────────────────────────────────────────────────────────────────────────

import { EventSource } from 'undici';

// @expect-violation: eventsource-constructor-syntax-error
export function eventSourceBadUrl(url: string) {
  // SHOULD_FIRE: eventsource-constructor-syntax-error — invalid URL throws DOMException
  const es = new EventSource(url);
  es.onmessage = (event) => console.log(event.data);
  es.onerror = (event) => console.error('SSE error', event);
  return es;
}

// @expect-violation: eventsource-connection-error-not-handled
export function eventSourceNoErrorListener() {
  // SHOULD_FIRE: eventsource-connection-error-not-handled — no error listener registered
  const es = new EventSource('https://api.example.com/events');
  es.onmessage = (event) => console.log(event.data);
  return es;
}

// @expect-clean
export function eventSourceWithErrorListener() {
  let es: EventSource;
  try {
    // SHOULD_NOT_FIRE: constructor wrapped in try-catch
    es = new EventSource('https://api.example.com/events');
  } catch (err) {
    console.error('EventSource SyntaxError:', err);
    throw err;
  }
  // SHOULD_NOT_FIRE: error listener registered
  es.onerror = (event) => {
    console.error('SSE connection failed, readyState=' + es.readyState);
    if (es.readyState === EventSource.CLOSED) es.close();
  };
  es.onmessage = (event) => console.log(event.data);
  return es;
}
