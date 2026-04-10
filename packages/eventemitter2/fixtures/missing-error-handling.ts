import { EventEmitter2 } from 'eventemitter2';

// Missing error handler
class MyService extends EventEmitter2 {
  async doWork() {
    try {
      // Some async work
      throw new Error('Work failed');
    } catch (error) {
      // Emitting error without any listeners attached
      this.emit('error', error);
    }
  }
}

// Usage without error listener
const service = new MyService();
service.doWork(); // Will throw uncaught exception
