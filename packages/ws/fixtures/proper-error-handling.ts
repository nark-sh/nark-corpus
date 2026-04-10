import WebSocket from 'ws';

/**
 * Proper error handling for WebSocket connection
 * Should NOT trigger violations.
 */
function connectWithErrorHandling() {
  const ws = new WebSocket('ws://localhost:8080');

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  ws.on('open', () => {
    try {
      ws.send('Hello Server!');
    } catch (error) {
      console.error('Send failed:', error);
    }
  });
}
