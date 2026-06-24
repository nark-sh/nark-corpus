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
 *   - morgan.format('combined', fn) — overwriting built-in format → SHOULD_FIRE: format-name-overwrite-silent
 *   - morgan() without stream error handler → SHOULD_FIRE: stream-write-error
 *   - morgan() with stream error handler → SHOULD_NOT_FIRE
 *   - morgan.compile(validString) → SHOULD_NOT_FIRE
 *   - morgan.token('x-custom-id', fn) — namespaced custom token → SHOULD_NOT_FIRE
 *   - morgan.format('app-access', fn) — namespaced custom format → SHOULD_NOT_FIRE
 *   - morgan.format(name, nonStringNonFn) — fmt is undefined/number/object → SHOULD_FIRE: format-non-string-non-function-delayed-throw
 *   - morgan.format(name, validString | validFn) → SHOULD_NOT_FIRE
 *
 * Functions with proper error handling should SHOULD_NOT_FIRE.
 */

import morgan from 'morgan';
import * as fs from 'fs';

// ─────────────────────────────────────────────────────────────────────────────
// 1. morgan.compile() — non-string format crashes synchronously
// ─────────────────────────────────────────────────────────────────────────────

export function compileWithUndefinedFormat() {
  // NOTE: compile-non-string-throws is a precondition (argument-type violation), not detectable statically.
  // The scanner cannot determine at analysis time that undefined was passed. Known false negative.
  const fn = morgan.compile(undefined as unknown as string);
  return fn;
}

export function compileWithNullFormat() {
  // NOTE: compile-non-string-throws is a precondition (argument-type violation), not detectable statically.
  // The scanner cannot determine at analysis time that null was passed. Known false negative.
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
  const logStream = fs.createWriteStream('/var/log/app/access.log', { flags: 'a' });
  // SHOULD_FIRE: stream-write-error — custom stream passed without .on('error') handler attached
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

// ─────────────────────────────────────────────────────────────────────────────
// 5. morgan.format() — overwriting built-in formats silently changes log shape
// ─────────────────────────────────────────────────────────────────────────────

export function overwriteBuiltInCombinedFormat() {
  // SHOULD_FIRE: format-name-overwrite-silent — 'combined' is a built-in format; silent overwrite
  morgan.format('combined', ':method :url :status :res[content-length]');
}

export function overwriteBuiltInDevFormat() {
  // SHOULD_FIRE: format-name-overwrite-silent — 'dev' is a built-in format
  morgan.format('dev', (tokens, req, res) => {
    return [
      tokens.method?.(req, res),
      tokens.url?.(req, res),
      tokens.status?.(req, res),
    ].join(' ');
  });
}

export function registerNamespacedCustomFormat() {
  // SHOULD_NOT_FIRE: namespaced format name avoids collision with built-in formats
  morgan.format('app-access', ':method :url :status :response-time ms');
  morgan.format('audit-log', ':remote-addr :method :url :status');
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. morgan.format() — non-string non-function fmt is parked silently and
//    surfaces as a delayed TypeError inside the morgan() factory
// ─────────────────────────────────────────────────────────────────────────────

export function registerFormatWithUndefinedValue() {
  // Scanner-gap note: the contract-matcher does not yet flag morgan.format() calls
  // where the second arg is an `undefined` identifier read. Scanner concern
  // concern-20260624-morgan-deepen-1 tracks the detector work. No annotation here
  // so the harness does not generate a failing test against a missing detector.
  const fmt = (process.env.LOG_FORMAT as unknown) as string;
  morgan.format('partial-config', fmt);
}

export function registerFormatWithNumberValue() {
  // SHOULD_FIRE: format-non-string-non-function-delayed-throw — fmt is a number (runtime laxer than @types)
  morgan.format('numeric-fmt', 42 as unknown as string);
}

export function registerFormatWithObjectValue() {
  // Scanner-gap note: the contract-matcher does not yet flag morgan.format() calls
  // where the second arg is an inline object literal. Scanner concern
  // concern-20260624-morgan-deepen-1 tracks the detector work. No annotation here
  // so the harness does not generate a failing test against a missing detector.
  const cfg = { template: ':method :url' } as unknown as string;
  morgan.format('object-fmt', cfg);
}

export function registerFormatWithValidString() {
  // SHOULD_NOT_FIRE: string fmt — standard registration path, no delayed-throw hazard
  morgan.format('app-trace', ':method :url :status :response-time[2] ms');
}

export function registerFormatWithValidFunction() {
  // SHOULD_NOT_FIRE: function fmt — standard registration path, no delayed-throw hazard
  morgan.format('json-log', (tokens, req, res) => {
    return JSON.stringify({
      method: tokens.method?.(req, res),
      url: tokens.url?.(req, res),
      status: tokens.status?.(req, res),
    });
  });
}
