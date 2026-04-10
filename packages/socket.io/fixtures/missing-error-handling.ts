import { Server } from 'socket.io';

const io = new Server();

// ❌ Missing error handling in async event handler
io.on('connection', (socket) => {
  socket.on('message', async (data) => {
    await processMessage(data);
    socket.emit('success', { status: 'ok' });
  });
  
  socket.on('getData', async () => {
    const result = await fetchData();
    socket.emit('data', result);
  });
});
