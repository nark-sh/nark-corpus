import { Server } from 'socket.io';

class ChatServer {
  private io = new Server();

  start() {
    this.io.on('connection', (socket) => {
      // ❌ No error handling
      socket.on('chat', async (msg) => {
        await this.saveMessage(msg);
        this.io.emit('broadcast', msg);
      });
    });
  }

  async saveMessage(msg: any) { /* ... */ }
}
