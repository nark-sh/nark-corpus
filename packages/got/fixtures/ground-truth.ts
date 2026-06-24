/**
 * got Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "got"):
 *   - got.extend()  postcondition: inherited-http-error
 *
 * Detection path: got.extend() call →
 *   ThrowingFunctionDetector fires method call →
 *   ContractMatcher checks try-catch → postcondition fires
 */

import got from 'got';

// ─────────────────────────────────────────────────────────────────────────────
// 1. got.extend() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export function createClientNoCatch() {
  // SHOULD_FIRE: inherited-http-error — got.extend() inherits error config. No try-catch.
  const client = got.extend({
    prefixUrl: 'https://api.example.com',
    timeout: { request: 5000 },
  });
  return client;
}

export function createClientWithCatch() {
  try {
    // SHOULD_NOT_FIRE: got.extend() inside try-catch satisfies error handling
    const client = got.extend({
      prefixUrl: 'https://api.example.com',
      timeout: { request: 5000 },
    });
    return client;
  } catch (err) {
    console.error('Client creation failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. got.extend() — second pattern
// ─────────────────────────────────────────────────────────────────────────────

export function createAuthClientNoCatch(apiKey: string) {
  // SHOULD_FIRE: inherited-http-error — got.extend() with auth headers. No try-catch.
  const client = got.extend({
    prefixUrl: 'https://api.example.com',
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  return client;
}

export function createAuthClientWithCatch(apiKey: string) {
  try {
    // SHOULD_NOT_FIRE: got.extend() inside try-catch satisfies error handling
    const client = got.extend({
      prefixUrl: 'https://api.example.com',
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return client;
  } catch (err) {
    console.error('Client creation failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. got.paginate.all() — Promise-returning paginator-aggregator (added 2026-06-23)
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchAllCommitsNoCatch() {
  // SHOULD_FIRE: paginate-all-http-error / paginate-all-network-error —
  // bare await on got.paginate.all() with no try-catch. Any failing page rejects
  // the Promise and discards the entire result set.
  const commits = await got.paginate.all<{ sha: string }>(
    'https://api.github.com/repos/sindresorhus/got/commits',
    { pagination: { countLimit: 10 } },
  );
  return commits;
}

export async function fetchAllCommitsWithCatch() {
  try {
    // SHOULD_NOT_FIRE: got.paginate.all() inside try-catch — proper handling.
    const commits = await got.paginate.all<{ sha: string }>(
      'https://api.github.com/repos/sindresorhus/got/commits',
      { pagination: { countLimit: 10 } },
    );
    return commits;
  } catch (err) {
    console.error('Pagination failed:', err);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. got.stream.<method>() — HTTP-aliased Stream API shortcuts (added 2026-06-23)
//    Errors emit as 'error' events, NOT Promise rejections.
//    try-catch on the synchronous call catches nothing.
// ─────────────────────────────────────────────────────────────────────────────

import { pipeline } from 'node:stream/promises';
import { createWriteStream } from 'node:fs';

export async function downloadFileStreamNoErrorListener() {
  // SHOULD_FIRE: stream-alias-error-event — got.stream.get() returns a Duplex
  // that emits errors as 'error' events. No .on('error', ...) listener attached
  // and no pipeline() — silent crash on network failure.
  const stream = got.stream.get('https://example.com/file.bin');
  stream.pipe(createWriteStream('/tmp/file.bin'));
}

export async function downloadFileStreamWithPipeline() {
  // SHOULD_NOT_FIRE: pipeline() propagates errors from the got stream into
  // the awaited Promise, which is itself wrapped in try-catch.
  try {
    await pipeline(
      got.stream.get('https://example.com/file.bin'),
      createWriteStream('/tmp/file.bin'),
    );
  } catch (err) {
    console.error('Download failed:', err);
    throw err;
  }
}

export function uploadStreamPostNoErrorListener(body: NodeJS.ReadableStream) {
  // SHOULD_FIRE: stream-alias-error-event — got.stream.post() returns a Writable
  // that emits errors as 'error' events. No listener attached.
  const upload = got.stream.post('https://example.com/upload');
  body.pipe(upload);
}

export async function uploadStreamPostWithPipeline(body: NodeJS.ReadableStream) {
  // SHOULD_NOT_FIRE: pipeline() catches and forwards 'error' events from both
  // ends of the pipe.
  try {
    await pipeline(body, got.stream.post('https://example.com/upload'));
  } catch (err) {
    console.error('Upload failed:', err);
    throw err;
  }
}

export function streamPutNoListener(body: NodeJS.ReadableStream) {
  // SHOULD_FIRE: stream-alias-error-event — same contract as stream.post.
  const upload = got.stream.put('https://example.com/asset.bin');
  body.pipe(upload);
}

export function streamPatchNoListener(body: NodeJS.ReadableStream) {
  // SHOULD_FIRE: stream-alias-error-event.
  const upload = got.stream.patch('https://example.com/asset.bin');
  body.pipe(upload);
}

export function streamHeadNoListener() {
  // SHOULD_FIRE: stream-alias-error-event — HEAD stream still emits errors.
  const stream = got.stream.head('https://example.com/asset.bin');
  stream.resume();
}

export function streamDeleteNoListener() {
  // SHOULD_FIRE: stream-alias-error-event.
  const stream = got.stream.delete('https://example.com/asset.bin');
  stream.resume();
}

export function streamGetWithErrorListener() {
  // SHOULD_NOT_FIRE: stream.on('error', handler) is the required handling.
  const stream = got.stream.get('https://example.com/file.bin');
  stream.on('error', (err: Error) => {
    console.error('Stream error:', err);
  });
  stream.pipe(createWriteStream('/tmp/file.bin'));
}
