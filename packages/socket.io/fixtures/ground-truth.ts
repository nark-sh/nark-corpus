/**
 * socket.io Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the socket.io contract spec v1.1.0 (2026-04-13 depth pass).
 *
 * Contracted functions and their postcondition IDs:
 *   emit()                      postconditions: emit-no-error-handling
 *   on()                        postconditions: on-handler-no-error-handling
 *   emitWithAck()               postconditions: emit-with-ack-no-timeout-hangs, emit-with-ack-timeout-unhandled
 *   socket.join()               postconditions: socket-join-adapter-error
 *   fetchSockets()              postconditions: fetch-sockets-adapter-error, fetch-sockets-dynamic-namespace
 *   Server.close()              postconditions: server-close-http-server-error
 *   Server.use()                postconditions: server-use-middleware-missing-next, server-use-middleware-async-unhandled-error
 *   serverSideEmitWithAck()     postconditions: server-side-emit-with-ack-timeout
 *
 * Detection: Server and Socket instance tracking (class_names: ["Server", "Socket"]).
 */

import { Server, Socket } from 'socket.io';
import * as http from 'http';

const httpServer = http.createServer();
const io = new Server(httpServer);

// ─────────────────────────────────────────────────────────────────────────────
// 1. emitWithAck — no timeout (hangs indefinitely)
// ─────────────────────────────────────────────────────────────────────────────

export async function emitWithAckNoTimeout(socket: Socket) {
  // SHOULD_FIRE: emit-with-ack-no-timeout-hangs — no .timeout() chained before emitWithAck
  const response = await socket.emitWithAck('confirm', { data: 'payload' });
  return response;
}

export async function emitWithAckWithTimeout(socket: Socket) {
  try {
    // SHOULD_NOT_FIRE: emitWithAck with .timeout() and try-catch satisfies error handling
    const response = await socket.timeout(5000).emitWithAck('confirm', { data: 'payload' });
    return response;
  } catch (err) {
    // Handles "operation has timed out" error
    console.error('emitWithAck timed out:', err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. emitWithAck — timeout set but no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function emitWithAckTimeoutNoCatch(socket: Socket) {
  // SHOULD_FIRE: emit-with-ack-timeout-unhandled — timeout set but no try-catch
  const response = await socket.timeout(5000).emitWithAck('confirm', { data: 'payload' });
  return response;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. socket.join — no error handling with distributed adapter
// ─────────────────────────────────────────────────────────────────────────────

export async function joinRoomNoCatch(socket: Socket, roomName: string) {
  // SHOULD_FIRE: socket-join-adapter-error — awaiting join without try-catch
  await socket.join(roomName);
}

export async function joinRoomWithCatch(socket: Socket, roomName: string) {
  try {
    // SHOULD_NOT_FIRE: join inside try-catch satisfies error handling
    await socket.join(roomName);
  } catch (err) {
    console.error('Failed to join room:', err);
    socket.disconnect(true);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. fetchSockets — no error handling
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchSocketsNoCatch() {
  // SHOULD_FIRE: fetch-sockets-adapter-error — fetchSockets without try-catch
  const sockets = await io.fetchSockets();
  return sockets.map(s => s.id);
}

export async function fetchSocketsInRoomNoCatch(room: string) {
  // SHOULD_FIRE: fetch-sockets-adapter-error — fetchSockets in room without try-catch
  const sockets = await io.in(room).fetchSockets();
  return sockets.length;
}

export async function fetchSocketsWithCatch() {
  try {
    // SHOULD_NOT_FIRE: fetchSockets inside try-catch satisfies error handling
    const sockets = await io.fetchSockets();
    return sockets.map(s => s.id);
  } catch (err) {
    console.error('fetchSockets failed (adapter error):', err);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Server.use — middleware missing next() call
// ─────────────────────────────────────────────────────────────────────────────

export function middlewareMissingNext() {
  // SHOULD_FIRE: server-use-middleware-missing-next — middleware can return without calling next
  io.use((socket, next) => {
    if (!socket.handshake.auth?.token) {
      return; // ← BUG: returns without calling next(err) — connection hangs
    }
    next();
  });
}

export function middlewareWithProperNext() {
  // SHOULD_NOT_FIRE: middleware always calls next() in both paths
  io.use((socket, next) => {
    if (!socket.handshake.auth?.token) {
      return next(new Error('unauthorized'));
    }
    next();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Server.use — async middleware without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export function asyncMiddlewareNoCatch() {
  // SHOULD_FIRE: server-use-middleware-async-unhandled-error — async middleware without try-catch
  io.use(async (socket, next) => {
    const user = await verifyToken(socket.handshake.auth?.token);
    socket.data.user = user;
    next();
    // ← if verifyToken() throws, unhandled rejection + next() never called
  });
}

export function asyncMiddlewareWithCatch() {
  // SHOULD_NOT_FIRE: async middleware with try-catch satisfies error handling
  io.use(async (socket, next) => {
    try {
      const user = await verifyToken(socket.handshake.auth?.token);
      socket.data.user = user;
      next();
    } catch (err) {
      next(new Error('authentication failed'));
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. serverSideEmitWithAck — no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function serverSideEmitWithAckNoCatch() {
  // SHOULD_FIRE: server-side-emit-with-ack-timeout — no try-catch for multi-server ack
  const responses = await io.serverSideEmitWithAck('invalidate-cache', 'user:123');
  return responses;
}

export async function serverSideEmitWithAckWithCatch() {
  try {
    // SHOULD_NOT_FIRE: serverSideEmitWithAck inside try-catch satisfies error handling
    const responses = await io.serverSideEmitWithAck('invalidate-cache', 'user:123');
    return responses;
  } catch (err: any) {
    // err.responses contains partial acknowledgements
    console.error('Some servers did not acknowledge:', err.message);
    console.log('Partial responses:', err.responses);
    return err.responses ?? [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper stub (not under test)
// ─────────────────────────────────────────────────────────────────────────────

async function verifyToken(token?: string): Promise<{ id: string }> {
  if (!token) throw new Error('missing token');
  return { id: 'user-123' };
}
