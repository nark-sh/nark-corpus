/**
 * Ground-truth fixtures for uuid contract depth pass (2026-04-17).
 * Tests parse(), validate(), version(), v7(), v3(), v5() postconditions.
 *
 * @expect-violation annotations mark code that SHOULD trigger scanner violations.
 * @expect-clean annotations mark code that should NOT trigger violations.
 */

import { parse, validate, version, v4, v7, v3, v5 } from 'uuid';

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
