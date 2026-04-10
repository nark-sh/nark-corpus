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
