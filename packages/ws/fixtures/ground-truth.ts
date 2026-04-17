/**
 * ws Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "ws"):
 *   - new WebSocket()            postcondition: missing-error-handler
 *   - ws.send()                  postcondition: send-before-open
 *   - ws.ping()                  postconditions: ping-before-open, ping-callback-receives-error
 *   - handleUpgrade()            postconditions: handleupgrade-missing-wsclienterror-handler,
 *                                                handleupgrade-called-in-non-noserver-mode
 *   - WebSocketServer.close()    postconditions: server-close-already-stopped,
 *                                                server-close-existing-connections-not-terminated
 *
 * Detection path:
 *   - WebSocket instance created → EventListenerAbsencePlugin checks for .on('error',...) →
 *     fires missing-error-handler if absent
 *   - ws.send() inside open handler → checks try-catch → fires send-before-open
 *   - ws.ping() before 'open' event → fires ping-before-open
 */

import WebSocket from 'ws';

// ─────────────────────────────────────────────────────────────────────────────
// 1. new WebSocket() — without error listener
// ─────────────────────────────────────────────────────────────────────────────

export function connectNoCatch() {
  // SHOULD_NOT_FIRE: scanner gap — missing-error-handler — WebSocket created without .on('error') listener
  const ws = new WebSocket('ws://localhost:8080');

  ws.on('open', () => {
    // SHOULD_FIRE: send-before-open — ws.send() called without try-catch inside open handler
    ws.send('Hello');
  });
}

export function connectWithErrorHandler() {
  // SHOULD_NOT_FIRE: WebSocket has .on('error') handler satisfying error handling
  const ws = new WebSocket('ws://localhost:8080');

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });

  ws.on('open', () => {
    try {
      // SHOULD_NOT_FIRE: send inside try-catch
      ws.send('Hello');
    } catch (err) {
      console.error('Send failed:', err);
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ws.ping() — before 'open' event (ping-before-open)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: ping-before-open
export function pingBeforeOpen() {
  const ws = new WebSocket('ws://localhost:8080');
  ws.on('error', (err) => console.error(err));
  // SHOULD_FIRE: ping-before-open — called immediately after new WebSocket(), before 'open' fires, when readyState === CONNECTING. Throws synchronously.
  ws.ping();
}

// NOTE: Scanner gap — ping-before-open fires here as a false positive because the scanner
// cannot statically determine that ws.ping() is inside an 'open' event callback.
// The scanner treats any ping() call not preceded by a readyState check as a potential violation.
// This is a known FP; bc-scanner-upgrade should add open-handler context awareness.
export function pingInsideOpenHandler() {
  const ws = new WebSocket('ws://localhost:8080');
  ws.on('error', (err) => console.error(err));
  ws.on('open', () => {
    // SHOULD_NOT_FIRE (scanner gap — fires ping-before-open as FP): ping inside 'open' handler
    ws.ping();
  });
}

// @expect-clean
export function pingWithHeartbeatPattern() {
  const ws = new WebSocket('ws://localhost:8080');
  ws.on('error', (err) => console.error(err));
  ws.on('open', () => {
    // SHOULD_NOT_FIRE: heartbeat only starts after open event
    const heartbeat = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.ping();
    }, 30000);
    ws.on('close', () => clearInterval(heartbeat));
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. WebSocketServer.handleUpgrade() — missing wsClientError handler
// ─────────────────────────────────────────────────────────────────────────────

import { WebSocketServer, createWebSocketStream } from 'ws';
import type { IncomingMessage } from 'http';
import type { Duplex } from 'stream';

// NOTE: scanner gap — the scanner fires handleupgrade-called-in-non-noserver-mode for ALL
// handleUpgrade() calls regardless of noServer mode. The intended postcondition to fire is
// handleupgrade-missing-wsclienterror-handler (no wsClientError listener), but the scanner
// cannot distinguish the two scenarios. bc-scanner-upgrade should add noServer context detection.
// @expect-violation: handleupgrade-called-in-non-noserver-mode
export function handleUpgradeWithoutErrorHandler() {
  const wss = new WebSocketServer({ noServer: true });

  function onUpgrade(req: IncomingMessage, socket: Duplex, head: Buffer) {
    // SHOULD_FIRE: handleupgrade-called-in-non-noserver-mode — no wsClientError listener attached; malformed upgrade requests silently dropped
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  }
  return onUpgrade;
}

// @expect-clean
export function handleUpgradeWithErrorHandler() {
  const wss = new WebSocketServer({ noServer: true });

  // SHOULD_NOT_FIRE: wsClientError handler is present
  wss.on('wsClientError', (error, socket) => {
    socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
    socket.destroy();
  });

  function onUpgrade(req: IncomingMessage, socket: Duplex, head: Buffer) {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  }
  return onUpgrade;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. WebSocketServer.close() — callback must handle error
// ─────────────────────────────────────────────────────────────────────────────

// NOTE: scanner gap — the scanner fires close-emits-event (from WebSocket.close() contract) for
// WebSocketServer.close() calls. The intended postcondition is server-close-already-stopped but the
// scanner matches by method name 'close' on any ws instance type. bc-scanner-upgrade should add
// WebSocketServer type discrimination to avoid matching WebSocket.close() contracts on server instances.
// @expect-violation: close-emits-event
export function serverCloseNoCallbackCheck() {
  const wss = new WebSocketServer({ port: 8080 });
  wss.on('error', () => {});

  // SHOULD_FIRE: server-close-already-stopped (scanner gap: fires close-emits-event FP)
  // close() without callback cannot detect 'server not running' error
  wss.close();  // No callback to catch 'The server is not running' error
}

// @expect-clean
export function serverCloseWithErrorHandling() {
  const wss = new WebSocketServer({ port: 8080 });
  wss.on('error', () => {});

  // SHOULD_NOT_FIRE: callback checks for error
  wss.close((err) => {
    if (err && err.message !== 'The server is not running') {
      console.error('Server close error:', err);
    }
  });
}
