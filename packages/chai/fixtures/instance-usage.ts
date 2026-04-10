/**
 * Test fixture for chai instance and chain usage
 *
 * This file demonstrates chai used via instance references and chained APIs.
 * It tests the analyzer's ability to detect violations through chai instances
 * imported and used in various patterns.
 *
 * Some usages should be clean (test context), some should trigger warnings (production context).
 */

import chai, { expect, assert } from 'chai';

// Class using chai for validation — represents production usage that needs error handling
class UserValidator {
  validate(user: { name: string; email: string; age: number }): boolean {
    try {
      // CORRECT: try-catch wrapping chai in non-test class method
      expect(user.name).to.be.a('string').and.not.empty;
      expect(user.email).to.include('@');
      expect(user.age).to.be.a('number').that.is.above(0);
      return true;
    } catch (error) {
      console.error('Validation error:', error instanceof Error ? error.message : error);
      return false;
    }
  }

  // VIOLATION: Instance method using chai without error handling in production class
  validateWithoutHandling(value: unknown): boolean {
    // ❌ No try-catch — AssertionError will propagate from this production method
    expect(value).to.not.be.null;
    expect(value).to.not.be.undefined;
    return true;
  }
}

// Using chai.assert directly (chai default export)
class ConfigValidator {
  check(config: { timeout: number; retries: number }) {
    try {
      // CORRECT: Using chai.assert via the default import with error handling
      chai.assert.isNumber(config.timeout, 'timeout must be a number');
      chai.assert.isAbove(config.timeout, 0, 'timeout must be positive');
      chai.assert.isNumber(config.retries, 'retries must be a number');
    } catch (error) {
      throw new Error(`Config validation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// CORRECT: chai used in a test helper where AssertionError is expected
export function assertStatusCode(response: { status: number }, expectedStatus: number) {
  // This function is designed to be used in tests — AssertionError is expected here
  expect(response.status).to.equal(expectedStatus);
}

// CORRECT: chai.assert used in test helper
export function assertArrayContains<T>(arr: T[], item: T) {
  assert.include(arr, item, `Expected array to contain ${item}`);
}

// VIOLATION: chai used in an API route handler (production code) without error handling
export function handleApiRequest(params: { id: string; page: number }) {
  // ❌ This function simulates a route handler — chai assertions here should be wrapped
  expect(params.id).to.be.a('string').and.match(/^[a-z0-9-]+$/);
  expect(params.page).to.be.a('number').and.be.above(0);

  return { id: params.id, page: params.page };
}

export { UserValidator, ConfigValidator };
