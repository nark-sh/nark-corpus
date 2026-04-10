import { Server } from 'socket.io';

const io = new Server();

// ✅ Proper error handling in event handlers
io.on('connection', (socket) => {
  socket.on('message', async (data) => {
    try {
      await processMessage(data);
      socket.emit('success', { status: 'ok' });
    } catch (error) {
      console.error('Message processing failed:', error);
      socket.emit('error', { message: 'Processing failed' });
    }
  });
});
