import { EventEmitter2 } from 'eventemitter2';

// Proper error handling
class MyService extends EventEmitter2 {
  async doWork() {
    try {
      // Some async work
      throw new Error('Work failed');
    } catch (error) {
      this.emit('error', error);
    }
  }
}

// Usage with error listener
const service = new MyService();
service.on('error', (error) => {
  console.error('Service error:', error);
});
service.doWork(); // Error is handled
