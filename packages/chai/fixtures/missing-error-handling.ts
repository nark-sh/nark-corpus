/**
 * Test fixture with INCORRECT chai usage — missing error handling
 *
 * This file demonstrates code where chai assertions are used in production
 * (non-test) contexts WITHOUT try-catch. These should trigger WARNING violations
 * because AssertionError can crash the application if not caught.
 *
 * The analyzer should detect violations in this file.
 */

import { expect, assert } from 'chai';

// VIOLATION: Using chai.expect in a production-style function without try-catch.
// If the assertion fails, AssertionError propagates uncaught and crashes the app.
export function validateUserWithoutHandling(user: { name: string; age: number }) {
  // ❌ No try-catch — AssertionError will propagate if user.name is not a string
  expect(user.name).to.be.a('string');
  expect(user.age).to.be.above(0);
  return true;
}

// VIOLATION: Using assert-style in production code without error handling.
// assert.ok() throws AssertionError when the condition is falsy.
export function checkConditionWithoutHandling(condition: boolean, message: string) {
  // ❌ No try-catch — AssertionError propagates on failure
  assert.ok(condition, message);
  assert.isBoolean(condition, 'condition must be a boolean');
}

// VIOLATION: Deeply nested assertion in production code, no try-catch.
export function validateResponseWithoutHandling(response: { status: number; body: object }) {
  // ❌ No try-catch
  expect(response.status).to.equal(200);
  expect(response.body).to.be.an('object').that.is.not.empty;
}

// VIOLATION: assert.equal in a non-test helper without error handling
export function assertIdsMatch(id1: string, id2: string) {
  // ❌ No try-catch — will throw AssertionError if ids differ
  assert.equal(id1, id2, 'IDs must match');
}

// VIOLATION: Chain of expects without protection
export function validateConfigWithoutHandling(config: { host: string; port: number; ssl: boolean }) {
  // ❌ No try-catch around these production guards
  expect(config.host).to.be.a('string').and.not.empty;
  expect(config.port).to.be.a('number').within(1, 65535);
  expect(config.ssl).to.be.a('boolean');
}
