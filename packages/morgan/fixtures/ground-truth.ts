/**
 * Morgan Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the morgan contract spec, NOT V1 behavior.
 *
 * Key contract rules:
 *   - morgan.compile(nonString) → SHOULD_FIRE: compile-non-string-throws
 *   - morgan.compile(format) with unregistered tokens → SHOULD_FIRE: compile-invalid-token-syntax-silent
 *   - morgan.token('status', fn) — overwriting built-in token → SHOULD_FIRE: token-name-overwrite-silent
 *   - morgan() without stream error handler → SHOULD_FIRE: stream-write-error
 *   - morgan() with stream error handler → SHOULD_NOT_FIRE
 *   - morgan.compile(validString) → SHOULD_NOT_FIRE
 *   - morgan.token('x-custom-id', fn) — namespaced custom token → SHOULD_NOT_FIRE
 *
 * Functions with proper error handling should SHOULD_NOT_FIRE.
 */

import morgan from 'morgan';
import * as fs from 'fs';

// ─────────────────────────────────────────────────────────────────────────────
// 1. morgan.compile() — non-string format crashes synchronously
// ─────────────────────────────────────────────────────────────────────────────

export function compileWithUndefinedFormat() {
  // SHOULD_FIRE: compile-non-string-throws — calling compile(undefined) throws TypeError synchronously
  const fn = morgan.compile(undefined as unknown as string);
  return fn;
}

export function compileWithNullFormat() {
  // SHOULD_FIRE: compile-non-string-throws — calling compile(null) throws TypeError synchronously
  const fn = morgan.compile(null as unknown as string);
  return fn;
}

export function compileWithValidFormat() {
  // SHOULD_NOT_FIRE: valid string format — compile() succeeds
  const fn = morgan.compile(':method :url :status :response-time ms');
  return fn;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. morgan.compile() — unregistered tokens produce silent '-' output
// ─────────────────────────────────────────────────────────────────────────────

export function compileWithUnregisteredToken() {
  // SHOULD_FIRE: compile-invalid-token-syntax-silent — :x-nonexistent-token will silently resolve to '-'
  const fn = morgan.compile(':method :url :x-nonexistent-token');
  return fn;
}

export function compileWithRegisteredToken() {
  // SHOULD_NOT_FIRE: token registered before compile — resolves correctly
  morgan.token('x-trace-id', (req) => (req as any).headers['x-trace-id'] as string);
  const fn = morgan.compile(':method :url :x-trace-id');
  return fn;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. morgan.token() — overwriting built-in tokens silently changes global behavior
// ─────────────────────────────────────────────────────────────────────────────

export function overwriteBuiltInStatusToken() {
  // SHOULD_FIRE: token-name-overwrite-silent — 'status' is a built-in token; silent global overwrite
  morgan.token('status', (req, res) => {
    return String((res as any).statusCode ?? 'unknown');
  });
}

export function overwriteBuiltInMethodToken() {
  // SHOULD_FIRE: token-name-overwrite-silent — 'method' is a built-in token; silent global overwrite
  morgan.token('method', (req) => {
    return (req as any).method?.toLowerCase() ?? 'unknown';
  });
}

export function registerNamespacedCustomToken() {
  // SHOULD_NOT_FIRE: namespaced token name avoids collision with built-in tokens
  morgan.token('x-request-id', (req) => (req as any).headers['x-request-id'] as string);
  morgan.token('app-user-id', (req) => (req as any).user?.id as string);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. morgan() middleware factory — stream without error handler
// ─────────────────────────────────────────────────────────────────────────────

export function morganWithUnsafeStream() {
  // SHOULD_FIRE: stream-write-error — custom stream passed without .on('error') handler attached
  const logStream = fs.createWriteStream('/var/log/app/access.log', { flags: 'a' });
  const middleware = morgan('combined', { stream: logStream });
  return middleware;
}

export function morganWithSafeStream() {
  // SHOULD_NOT_FIRE: error handler attached before passing to morgan
  const logStream = fs.createWriteStream('/var/log/app/access.log', { flags: 'a' });
  logStream.on('error', (err: Error) => {
    console.error('Morgan log stream error:', err);
  });
  const middleware = morgan('combined', { stream: logStream });
  return middleware;
}
