/**
 * Test fixture with CORRECT chai usage
 *
 * This file demonstrates code that properly handles all behavioral contracts.
 * Chai assertions are used in test code where AssertionError is expected and caught
 * by the test framework. In production validation code, assertions are wrapped in try-catch.
 *
 * The analyzer should produce ZERO violations for this file.
 */

import { expect, assert, should } from 'chai';

// Initialize should-style assertions
should();

// CORRECT: Using chai in test context where AssertionError is expected and caught by the test runner
// This is the standard test pattern — no try-catch needed because test framework handles it
export function testUserIsAdmin(user: { role: string }) {
  expect(user).to.have.property('role');
  expect(user.role).to.equal('admin');
}

// CORRECT: Using assert-style in a test that the test framework will catch
export function testCountIsPositive(count: number) {
  assert.isAbove(count, 0, 'Count must be positive');
  assert.isNumber(count, 'Count must be a number');
}

// CORRECT: Using chai.expect in production validation code WITH try-catch
export function validateUserInProduction(user: { name: string; email: string }): boolean {
  try {
    expect(user).to.have.property('name');
    expect(user).to.have.property('email');
    expect(user.name).to.be.a('string').and.not.empty;
    return true;
  } catch (error) {
    // Handle AssertionError from chai when used outside test context
    if (error instanceof Error) {
      console.error('Validation failed:', error.message);
    }
    return false;
  }
}

// CORRECT: Using assert in production code with error handling
export function assertProductionPreconditions(value: unknown): void {
  try {
    assert.isDefined(value, 'value must be defined');
    assert.isNotNull(value, 'value must not be null');
  } catch (error) {
    // Wrapping chai assertions used outside of tests
    throw new Error(`Precondition failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// CORRECT: Deep equality check with error handling in non-test context
export function compareObjects(actual: object, expected: object): boolean {
  try {
    expect(actual).to.deep.equal(expected);
    return true;
  } catch (error) {
    console.error('Objects do not match:', error instanceof Error ? error.message : error);
    return false;
  }
}

// CORRECT: should-style with proper try-catch for production use
export function validateWithShould(value: string): boolean {
  try {
    value.should.be.a('string');
    value.should.not.be.empty;
    return true;
  } catch (error) {
    console.error('Validation error:', error instanceof Error ? error.message : error);
    return false;
  }
}
