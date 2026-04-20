/**
 * socket.io Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the socket.io contract spec v1.1.0 (2026-04-20 depth pass).
 *
 * Contracted functions and their postcondition IDs:
 *   emit()                           postconditions: emit-no-error-handling
 *   on()                             postconditions: on-handler-no-error-handling
 *   emitWithAck()                    postconditions: emit-with-ack-no-timeout-hangs, emit-with-ack-timeout-unhandled
 *   socket.join()                    postconditions: socket-join-adapter-error
 *   fetchSockets()                   postconditions: fetch-sockets-adapter-error, fetch-sockets-dynamic-namespace
 *   Server.close()                   postconditions: server-close-http-server-error
 *   Server.use()                     postconditions: server-use-middleware-missing-next, server-use-middleware-async-unhandled-error
 *   serverSideEmitWithAck()          postconditions: server-side-emit-with-ack-timeout
 *   socket.use()                     postconditions: socket-use-middleware-error-no-listener, socket-use-middleware-async-unhandled
 *   BroadcastOperator.emitWithAck()  postconditions: broadcast-emit-with-ack-timeout-unhandled, broadcast-emit-with-ack-no-timeout
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
// 8. socket.use() — per-socket middleware without error listener
// ─────────────────────────────────────────────────────────────────────────────

export function perSocketMiddlewareNoErrorListener() {
  io.on('connection', (socket) => {
    // SHOULD_FIRE: socket-use-middleware-error-no-listener
    // next(err) is called but no socket.on('error') listener exists
    socket.use(([event, ...args], next) => {
      if (event === 'unauthorized') {
        return next(new Error('unauthorized event'));
      }
      next();
    });
    // ← BUG: no socket.on('error') listener; if next(err) fires, _onerror(err) emits
    //   'error' with no listener, potentially crashing the handler
  });
}

export function perSocketMiddlewareWithErrorListener() {
  io.on('connection', (socket) => {
    // SHOULD_NOT_FIRE: socket.use() with proper error listener
    socket.use(([event, ...args], next) => {
      if (event === 'unauthorized') {
        return next(new Error('unauthorized event'));
      }
      next();
    });
    // Properly handles middleware errors
    socket.on('error', (err) => {
      console.error('Socket middleware error:', err.message);
      socket.disconnect();
    });
  });
}

export function asyncPerSocketMiddlewareNoCatch() {
  io.on('connection', (socket) => {
    // SHOULD_FIRE: socket-use-middleware-async-unhandled
    // async middleware without try-catch; if validateEvent throws, rejection is unhandled
    socket.use(async ([event, ...args], next) => {
      await validateEvent(event);
      next();
      // ← if validateEvent() throws, next() never called, unhandled rejection
    });
    socket.on('error', (err) => {
      socket.disconnect();
    });
  });
}

export function asyncPerSocketMiddlewareWithCatch() {
  io.on('connection', (socket) => {
    // SHOULD_NOT_FIRE: async per-socket middleware with try-catch
    socket.use(async ([event, ...args], next) => {
      try {
        await validateEvent(event);
        next();
      } catch (err) {
        next(new Error('event validation failed'));
      }
    });
    socket.on('error', (err) => {
      socket.disconnect();
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. BroadcastOperator.emitWithAck() — broadcast with timeout but no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function broadcastEmitWithAckNoCatch() {
  // SHOULD_FIRE: broadcast-emit-with-ack-timeout-unhandled
  // timeout is set but no try-catch; if any client doesn't ack, throws "operation has timed out"
  const responses = await io.timeout(5000).emitWithAck('sync', { data: 'payload' });
  return responses;
}

export async function broadcastEmitWithAckWithCatch() {
  try {
    // SHOULD_NOT_FIRE: broadcast emitWithAck inside try-catch satisfies error handling
    const responses = await io.timeout(5000).emitWithAck('sync', { data: 'payload' });
    return responses;
  } catch (err: any) {
    // err.message === "operation has timed out"
    // err.responses contains partial acknowledgements
    console.error('Some clients did not ack:', err.responses?.length, 'responded');
    return err.responses ?? [];
  }
}

export async function broadcastEmitWithAckRoomNoCatch(room: string) {
  // SHOULD_FIRE: broadcast-emit-with-ack-no-timeout — no timeout chained, hangs indefinitely
  const responses = await io.to(room).emitWithAck('confirm', { data: 'payload' });
  return responses;
}

export async function broadcastEmitWithAckRoomWithTimeout(room: string) {
  try {
    // SHOULD_NOT_FIRE: timeout + try-catch satisfies both postconditions
    const responses = await io.to(room).timeout(5000).emitWithAck('confirm', { data: 'payload' });
    return responses;
  } catch (err: any) {
    console.error('Broadcast ack timeout in room:', room, err.responses?.length, 'responded');
    return err.responses ?? [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper stubs (not under test)
// ─────────────────────────────────────────────────────────────────────────────

async function verifyToken(token?: string): Promise<{ id: string }> {
  if (!token) throw new Error('missing token');
  return { id: 'user-123' };
}

async function validateEvent(event: string): Promise<void> {
  if (event === 'forbidden') throw new Error('forbidden event');
}
