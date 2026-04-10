import { io } from 'socket.io-client';

/**
 * Missing error handling for Socket.IO client
 * Should trigger ERROR violation.
 */
function connectWithoutErrorHandling() {
  const socket = io('http://localhost:3000');

  // ❌ No error listeners
  socket.on('connect', () => {
    socket.emit('message', 'Hello Server!');
  });
}
