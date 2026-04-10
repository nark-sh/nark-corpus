import { io, Socket } from 'socket.io-client';

/**
 * Edge cases and advanced patterns for Socket.IO client
 */

// PROPER - Event listeners registered outside connect
function properEventRegistration() {
  const socket = io('http://localhost:3000');

  // Register error handlers first
  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log('Disconnected:', reason);
  });

  // Register application event listeners OUTSIDE connect
  socket.on('message', (data) => {
    console.log('Message:', data);
  });

  socket.on('update', (data) => {
    console.log('Update:', data);
  });

  socket.on('notification', (data) => {
    console.log('Notification:', data);
  });

  // Connect handler only for connection-specific logic
  socket.on('connect', () => {
    console.log('Connected:', socket.id);
    socket.emit('join', { room: 'lobby' });
  });
}

// WRONG - Memory leak: Event listeners inside connect
function memoryLeakPattern() {
  const socket = io('http://localhost:3000');

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });

  // ❌ WRONG - Memory leak on reconnection
  socket.on('connect', () => {
    // Every reconnection adds duplicate listeners
    socket.on('message', (data) => {
      console.log('Message:', data);
    });

    socket.on('update', (data) => {
      console.log('Update:', data);
    });

    socket.on('notification', (data) => {
      console.log('Notification:', data);
    });
  });
}

// PROPER - Namespace usage with error handling
function namespaceUsage() {
  const adminSocket = io('http://localhost:3000/admin');
  const chatSocket = io('http://localhost:3000/chat');

  // Each namespace needs its own error handlers
  adminSocket.on('connect_error', (error) => {
    console.error('Admin connection error:', error);
  });

  chatSocket.on('connect_error', (error) => {
    console.error('Chat connection error:', error);
  });

  adminSocket.on('disconnect', (reason) => {
    console.log('Admin disconnected:', reason);
  });

  chatSocket.on('disconnect', (reason) => {
    console.log('Chat disconnected:', reason);
  });
}

// WRONG - Multiple namespaces without error handling
function namespaceWithoutErrorHandling() {
  const adminSocket = io('http://localhost:3000/admin');
  const chatSocket = io('http://localhost:3000/chat');

  // ❌ No error handlers on either socket
  adminSocket.on('admin-event', (data) => {
    console.log('Admin:', data);
  });

  chatSocket.on('chat-message', (data) => {
    console.log('Chat:', data);
  });
}

// PROPER - Binary data with error handling
function binaryDataHandling() {
  const socket = io('http://localhost:3000');

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });

  // Handle parser errors (known issue with binary data)
  socket.io.on('error', (error) => {
    console.error('Parser or transport error:', error);
    // May need to manually reconnect
    if (!socket.connected) {
      socket.connect();
    }
  });

  socket.on('binary-data', (buffer: ArrayBuffer) => {
    try {
      // Process binary data
      const view = new DataView(buffer);
      console.log('Binary data received:', view.byteLength);
    } catch (error) {
      console.error('Failed to process binary data:', error);
    }
  });
}

// PROPER - Authentication with reconnection
async function authenticationWithReconnection() {
  let authToken = await fetchAuthToken();

  const socket = io('http://localhost:3000', {
    auth: { token: authToken }
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);

    if (!socket.active) {
      // Server rejected - likely auth failure
      console.log('Authentication failed, refreshing token');

      fetchAuthToken().then((newToken) => {
        authToken = newToken;
        socket.auth = { token: newToken };
        socket.connect();
      });
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('Disconnected:', reason);
  });
}

async function fetchAuthToken(): Promise<string> {
  // Simulate async token fetch
  return 'auth-token-' + Date.now();
}

// PROPER - Multiple socket.active checks
function socketActiveChecks() {
  const socket = io('http://localhost:3000');

  socket.on('connect_error', (error) => {
    if (socket.active) {
      // Temporary failure, will auto-reconnect
      showReconnectingIndicator();
    } else {
      // Server denied connection
      showErrorMessage('Unable to connect: ' + error.message);
    }
  });

  socket.on('disconnect', (reason) => {
    if (socket.active) {
      // Will auto-reconnect
      showReconnectingIndicator();
    } else {
      // Permanent disconnection
      if (reason === 'io server disconnect') {
        showErrorMessage('Server closed the connection');
      } else if (reason === 'io client disconnect') {
        showInfoMessage('You disconnected');
      }
    }
  });
}

function showReconnectingIndicator() {
  console.log('[UI] Reconnecting...');
}

function showErrorMessage(message: string) {
  console.error('[UI] Error:', message);
}

function showInfoMessage(message: string) {
  console.log('[UI] Info:', message);
}

// PROPER - Forced WebSocket transport with error handling
function forcedWebSocketTransport() {
  const socket = io('http://localhost:3000', {
    transports: ['websocket'],
    upgrade: false
  });

  socket.on('connect_error', (error) => {
    console.error('WebSocket connection failed:', error);
  });

  // Engine-level errors provide more details
  socket.io.engine.on('connection_error', (error) => {
    console.error('Transport error:', {
      message: error.message,
      description: error.description,
      context: error.context
    });
  });
}

// WRONG - Forced transport without error handling
function forcedTransportWithoutErrorHandling() {
  const socket = io('http://localhost:3000', {
    transports: ['websocket'],
    upgrade: false
  });

  // ❌ No error handlers - WebSocket failures go unnoticed
  socket.on('connect', () => {
    console.log('Connected via WebSocket');
  });
}

// PROPER - Reconnection with exponential backoff monitoring
class ReconnectionMonitor {
  private socket: Socket;
  private reconnectAttempts = 0;

  constructor(url: string) {
    this.socket = io(url, {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });

    this.socket.on('connect_error', (error) => {
      console.error(`Connection attempt failed (${this.reconnectAttempts + 1})`);
    });

    this.socket.io.on('reconnect_attempt', (attemptNumber) => {
      this.reconnectAttempts = attemptNumber;
      console.log(`Reconnection attempt ${attemptNumber}`);
    });

    this.socket.io.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      this.reconnectAttempts = 0;
    });

    this.socket.io.on('reconnect_error', (error) => {
      console.error('Reconnection failed:', error);
    });

    this.socket.io.on('reconnect_failed', () => {
      console.error('All reconnection attempts exhausted');
      this.handlePermanentFailure();
    });
  }

  private handlePermanentFailure() {
    console.log('Implementing fallback strategy');
    // Could switch to polling, notify user, etc.
  }
}

// PROPER - Cleanup on component unmount (React pattern)
function reactComponentPattern() {
  // In a React component:
  const socket = io('http://localhost:3000');

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });

  socket.on('message', (data) => {
    console.log('Message:', data);
  });

  // Cleanup function (would be in useEffect cleanup or componentWillUnmount)
  function cleanup() {
    socket.off('message'); // Remove specific listener
    socket.disconnect();    // Disconnect socket
  }

  return cleanup;
}
