import { io, Socket } from 'socket.io-client';

/**
 * Tests Socket.IO client instance usage patterns
 * Mix of proper and improper error handling
 */

// PROPER - Full error handling
class ChatClient {
  private socket: Socket;

  constructor(url: string) {
    this.socket = io(url);

    // Proper error handling
    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      if (!this.socket.active) {
        console.log('Server rejected connection');
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
    });

    this.socket.on('connect', () => {
      console.log('Connected:', this.socket.id);
    });
  }

  sendMessage(message: string) {
    this.socket.timeout(5000).emit('message', message, (error) => {
      if (error) {
        console.error('Message send timeout');
      }
    });
  }
}

// WRONG - No error handling
class DashboardClient {
  private socket: Socket;

  constructor(url: string) {
    this.socket = io(url);

    // ❌ No connect_error handler
    // ❌ No disconnect handler
    this.socket.on('metrics', (data) => {
      this.updateDashboard(data);
    });
  }

  private updateDashboard(data: any) {
    console.log('Dashboard updated:', data);
  }
}

// WRONG - Memory leak pattern
class NotificationClient {
  private socket: Socket;

  constructor(url: string) {
    this.socket = io(url);

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    // ❌ WRONG - Listeners inside connect event
    this.socket.on('connect', () => {
      // These will be duplicated on every reconnection
      this.socket.on('notification', (notification) => {
        console.log('Notification:', notification);
      });

      this.socket.on('alert', (alert) => {
        console.log('Alert:', alert);
      });
    });
  }
}

// PROPER - Comprehensive error handling with reconnection logic
class RobustClient {
  private socket: Socket;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(url: string, authToken: string) {
    this.socket = io(url, {
      auth: { token: authToken },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 20000
    });

    // Comprehensive error handling
    this.socket.on('connect_error', (error) => {
      console.error('Connection failed:', error.message);

      if (!this.socket.active) {
        // Server rejected - likely auth issue
        console.log('Authentication failed, refreshing token');
        this.refreshAuthAndReconnect();
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);

      if (this.socket.active) {
        console.log('Will auto-reconnect');
      } else if (reason === 'io server disconnect') {
        console.log('Server closed connection, manual reconnect needed');
      }
    });

    this.socket.io.on('reconnect_error', (error) => {
      this.reconnectAttempts++;
      console.error(`Reconnect attempt ${this.reconnectAttempts} failed`);
    });

    this.socket.io.on('reconnect_failed', () => {
      console.error('All reconnection attempts exhausted');
      this.handlePermanentFailure();
    });

    // Engine-level errors
    this.socket.io.engine.on('connection_error', (error) => {
      console.error('Transport error:', {
        message: error.message,
        description: error.description
      });
    });
  }

  private async refreshAuthAndReconnect() {
    // Simulate token refresh
    const newToken = await this.getNewAuthToken();
    this.socket.auth = { token: newToken };
    this.socket.connect();
  }

  private async getNewAuthToken(): Promise<string> {
    // Simulate async token fetch
    return 'new-token-123';
  }

  private handlePermanentFailure() {
    console.log('Connection permanently failed');
    // Implement fallback strategy
  }
}

// WRONG - No timeout on acknowledgements
class TimeoutMissingClient {
  private socket: Socket;

  constructor(url: string) {
    this.socket = io(url);

    this.socket.on('connect_error', (error) => {
      console.error(error);
    });
  }

  // ❌ RISKY - No timeout
  async fetchData(id: number) {
    this.socket.emit('get-data', { id }, (data) => {
      console.log('Data:', data);
      // This callback may never be called if server doesn't respond
    });
  }
}

// PROPER - Timeout with promise-based approach
class TimeoutProperClient {
  private socket: Socket;

  constructor(url: string) {
    this.socket = io(url);

    this.socket.on('connect_error', (error) => {
      console.error(error);
    });
  }

  async fetchData(id: number): Promise<any> {
    try {
      // Proper timeout handling
      const data = await this.socket.timeout(10000).emitWithAck('get-data', { id });
      return data;
    } catch (error) {
      console.error('Request failed or timed out:', error);
      throw error;
    }
  }
}
