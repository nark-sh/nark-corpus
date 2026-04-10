/**
 * ws Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "ws"):
 *   - new WebSocket()  postcondition: missing-error-handler
 *   - ws.send()        postcondition: send-before-open
 *
 * Detection path:
 *   - WebSocket instance created → EventListenerAbsencePlugin checks for .on('error',...) →
 *     fires missing-error-handler if absent
 *   - ws.send() inside open handler → checks try-catch → fires send-before-open
 */

import WebSocket from 'ws';

// ─────────────────────────────────────────────────────────────────────────────
// 1. new WebSocket() — without error listener
// ─────────────────────────────────────────────────────────────────────────────

export function connectNoCatch() {
  // SHOULD_FIRE: missing-error-handler — WebSocket created without .on('error') listener
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
