import WebSocket from 'ws';

/**
 * Missing error handling for WebSocket
 * Should trigger ERROR violation.
 */
function connectWithoutErrorHandling() {
  const ws = new WebSocket('ws://localhost:8080');

  // ❌ No error listener
  ws.on('open', () => {
    ws.send('Hello Server!'); // ❌ No try-catch
  });
}
