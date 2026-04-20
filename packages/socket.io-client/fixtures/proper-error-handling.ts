import { io } from 'socket.io-client';

/**
 * Proper error handling for Socket.IO client
 * Should NOT trigger violations.
 */
function connectWithErrorHandling() {
  const socket = io('http://localhost:3000');

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  socket.on('connect', () => {
    socket.emit('message', 'Hello Server!');
  });
}

/**
 * PROPER: Full reconnection observability using both reconnect_error and reconnect_failed.
 * Demonstrates socket.io.reconnect_error postcondition (reconnect-error-event).
 * Should NOT trigger violations.
 */
function connectWithReconnectionObservability() {
  const socket = io('http://localhost:3000', {
    reconnectionAttempts: 5
  });

  // Per-attempt reconnection failure (reconnect-error-event)
  socket.io.on('reconnect_error', (error) => {
    console.error('Reconnection attempt failed:', error.message);
  });

  // All attempts exhausted (reconnect-failed-event)
  socket.io.on('reconnect_failed', () => {
    console.error('All reconnection attempts exhausted');
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });
}
