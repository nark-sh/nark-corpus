/**
 * Ground-truth fixtures for uuid contract depth pass (2026-04-17).
 * Tests parse(), validate(), version(), v7(), v3(), v5() postconditions.
 *
 * Depth pass 2026-06-12 (deepen-stream-2 pass 5) extends with:
 *   - stringify-invalid-bytes (TypeError on invalid byte arrays)
 *   - v3-buffer-offset-out-of-bounds (RangeError new in uuid@14.0.0)
 *   - v5-buffer-offset-out-of-bounds (RangeError new in uuid@14.0.0)
 *
 * @expect-violation annotations mark code that SHOULD trigger scanner violations.
 * @expect-clean annotations mark code that should NOT trigger violations.
 */

import { parse, stringify, validate, version, v4, v7, v3, v5 } from 'uuid';

// ============================================================
// parse() — throws TypeError('Invalid UUID') on invalid input
// ============================================================

// @expect-violation: parse-invalid-uuid
// Calling parse() on a user-provided route param without validate() first.
// In production, req.params.id could be 'abc123' or a SQL injection string.
function parseUserIdWithoutValidation(userId: string): Uint8Array {
  return parse(userId); // ❌ throws TypeError if userId is not a valid UUID
}

// @expect-clean
// Correct pattern: validate before parse.
function parseUserIdWithValidation(userId: string): Uint8Array | null {
  if (!validate(userId)) {
    return null; // or throw a 400 error
  }
  return parse(userId); // ✅ safe — already validated
}

// @expect-violation: parse-invalid-uuid
// Directly using req.params without validation — common in Express route handlers.
function getRecordByIdHandler(id: string) {
  const bytes = parse(id); // ❌ crashes if id is not a UUID
  return bytes;
}

// ============================================================
// version() — throws TypeError('Invalid UUID') on invalid input
// ============================================================

// @expect-violation: version-invalid-uuid
// Calling version() on raw user input without validate() first.
function getUuidVersionFromUserInput(input: string): number {
  return version(input); // ❌ throws TypeError if input is not a valid UUID
}

// @expect-clean
// Correct pattern: validate before version().
function getUuidVersionSafe(input: string): number | null {
  if (!validate(input)) {
    return null;
  }
  return version(input); // ✅ safe
}

// ============================================================
// validate() — never throws, critical security gate
// ============================================================

// @expect-violation: validate-not-called-before-parse
// Application parses UUID from request without any validation.
function processIdFromRequest(requestId: string) {
  // ❌ No validate() call — parse() will throw for any invalid input
  const bytes = parse(requestId);
  return bytes;
}

// @expect-clean
// Proper middleware-style validation before any parse or DB operation.
function processIdSafely(requestId: string): Uint8Array | { error: string } {
  if (!validate(requestId)) {
    return { error: 'Invalid resource ID' };
  }
  return parse(requestId); // ✅ safe
}

// ============================================================
// v7() — sortable UUID, user input must be validated
// ============================================================

// @expect-clean
// Generating a v7 UUID is always safe in modern Node.js environments.
function createSortableId(): string {
  return v7(); // ✅ always succeeds in modern Node.js
}

// @expect-violation: v7-user-input-not-validated
// Using v7 UUIDs for DB IDs, but accepting from user without validate() check.
function getRecordByV7Id(id: string) {
  // ❌ No validate() — parse() below throws TypeError on invalid input
  const bytes = parse(id);
  return bytes;
}

// @expect-clean
// Full safe pattern for v7 UUID route handler.
function getRecordByV7IdSafe(id: string): Uint8Array | null {
  if (!validate(id)) {
    return null;
  }
  return parse(id); // ✅ safe
}

// ============================================================
// v3() and v5() — throws on invalid namespace
// ============================================================

// @expect-violation: v3-invalid-namespace
// Passing arbitrary string as namespace instead of valid UUID.
function generateV3WithBadNamespace(name: string): string {
  // ❌ 'my-custom-namespace' is NOT a valid UUID — throws TypeError
  return v3(name, 'my-custom-namespace');
}

// @expect-clean
// Using built-in DNS namespace constant — always safe.
function generateV3WithDnsNamespace(url: string): string {
  return v3(url, v3.URL); // ✅ v3.URL is a valid UUID constant
}

// @expect-violation: v5-invalid-namespace
// Same pattern as v3 — non-UUID namespace string.
function generateV5WithBadNamespace(name: string): string {
  // ❌ 'not-a-uuid-namespace' is NOT a valid UUID — throws TypeError
  return v5(name, 'not-a-uuid-namespace');
}

// @expect-clean
// Using built-in URL namespace — always safe.
function generateV5WithUrlNamespace(name: string): string {
  return v5(name, v5.URL); // ✅ v5.URL is a valid UUID constant
}

// ============================================================
// v4() crypto-unavailable — only relevant in restricted environments
// ============================================================

// @expect-clean
// Standard v4() call without custom rng — safe in all modern environments.
function generateRandomId(): string {
  return v4(); // ✅ always succeeds in Node.js 14.17+ and modern browsers
}

// ============================================================
// stringify() — throws TypeError('Stringified UUID is invalid')
// when called on byte arrays that don't encode a valid RFC 4122 UUID.
// Added by depth pass 2026-06-12 (deepen-stream-2 pass 5).
// ============================================================

// @expect-violation: stringify-invalid-bytes
// Reading raw bytes from a binary DB column without try-catch — corrupted or
// non-UUID bytes will crash the request handler.
function readUuidFromDbColumn(rowBytes: Uint8Array): string {
  return stringify(rowBytes); // ❌ throws if bytes don't decode to valid UUID
}

// @expect-clean
// Round-trip from a known-valid UUID — stringify never throws here.
function roundTripValidUuid(): boolean {
  const id = v4();
  const bytes = parse(id);
  const back = stringify(bytes); // ✅ safe — bytes came from parse(valid UUID)
  return back === id;
}

// @expect-clean
// Safe pattern for reading bytes from external source — wraps stringify in try-catch
// to handle corrupt or non-UUID bytes.
function readUuidSafe(rowBytes: Uint8Array): string | null {
  try {
    return stringify(rowBytes);
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Stringified UUID is invalid') {
      return null;
    }
    throw error;
  }
}

// ============================================================
// v3() / v5() with explicit buffer/offset — throws RangeError on out-of-bounds.
// New in uuid@14.0.0. Previous versions silently wrote past the buffer end.
// Added by depth pass 2026-06-12 (deepen-stream-2 pass 5).
// ============================================================

// @expect-violation: v3-buffer-offset-out-of-bounds
// Off-by-one buffer allocation — buf is only 16 bytes, but we ask for offset 8,
// which means writing bytes 8..23 into a 16-byte buffer.
function v3BufferOverflow(): Uint8Array {
  const buf = new Uint8Array(16);
  return v3('https://example.com', v3.URL, buf, 8); // ❌ throws RangeError in uuid@14+
}

// @expect-clean
// Properly sized buffer with valid offset.
function v3IntoBufferSafe(): Uint8Array {
  const buf = new Uint8Array(32); // room for 2 UUIDs
  v3('https://a.com', v3.URL, buf, 0);  // ✅ writes bytes 0..15
  v3('https://b.com', v3.URL, buf, 16); // ✅ writes bytes 16..31
  return buf;
}

// @expect-violation: v5-buffer-offset-out-of-bounds
// Negative offset — common typo from offset-- underflow.
function v5NegativeOffset(): Uint8Array {
  const buf = new Uint8Array(16);
  return v5('entity-name', v5.URL, buf, -1); // ❌ throws RangeError in uuid@14+
}

// @expect-clean
// Loop pattern with bounds check.
function v5BatchSafe(names: string[]): Uint8Array {
  const buf = new Uint8Array(names.length * 16);
  names.forEach((name, i) => {
    const offset = i * 16;
    if (offset + 16 > buf.length) {
      throw new Error('Buffer too small');
    }
    v5(name, v5.URL, buf, offset); // ✅ bounded
  });
  return buf;
}
