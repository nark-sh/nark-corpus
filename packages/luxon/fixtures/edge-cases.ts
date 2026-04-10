/**
 * Luxon Fixtures: Edge Cases and Complex Patterns
 *
 * Tests detection of validation in various edge cases:
 * - Validation in separate functions
 * - Conditional validation
 * - Framework patterns
 * - Settings.throwOnInvalid mode
 */

import { DateTime, Settings } from 'luxon';

/**
 * Edge Case 1: Validation in separate utility function
 * Analyzer may not track validation across function boundaries
 */
function validateDateTime(dt: DateTime): boolean {
  return dt.isValid;
}

function parseWithExternalValidation(input: string): DateTime | null {
  const dt = DateTime.fromISO(input);
  // Validation happens in separate function - may not be detected
  if (validateDateTime(dt)) {
    return dt;
  }
  return null;
}

/**
 * Edge Case 2: Validation through type guard
 * TypeScript pattern that may not be detected by analyzer
 */
function isValidDateTime(dt: DateTime): dt is DateTime {
  return dt.isValid;
}

function parseWithTypeGuard(input: string): DateTime | null {
  const dt = DateTime.fromISO(input);
  if (isValidDateTime(dt)) {
    return dt;
  }
  return null;
}

/**
 * Edge Case 3: Validation in complex conditional
 * Multiple conditions may make detection harder
 */
function parseWithComplexLogic(input: string, fallback: string): DateTime {
  const dt = DateTime.fromISO(input);
  const fallbackDt = DateTime.fromISO(fallback);

  if (dt.isValid && dt.year > 2000) {
    return dt;
  } else if (fallbackDt.isValid) {
    return fallbackDt;
  }

  return DateTime.now();
}

/**
 * Edge Case 4: Validation via invalidReason check
 * Alternative validation pattern using invalidReason instead of isValid
 */
function parseWithInvalidReason(input: string): DateTime | null {
  const dt = DateTime.fromISO(input);
  if (dt.invalidReason === null) {
    // Valid date (invalidReason is null)
    return dt;
  }
  console.error('Parse error:', dt.invalidReason);
  return null;
}

/**
 * Edge Case 5: Validation deferred to caller
 * Returns potentially invalid DateTime, expects caller to validate
 * ❌ This should probably trigger a violation
 */
function parseAndReturn(input: string): DateTime {
  const dt = DateTime.fromISO(input);
  return dt; // No validation here
}

function useParsed(input: string): string {
  const dt = parseAndReturn(input);
  if (!dt.isValid) {
    return 'Invalid';
  }
  return dt.toISO();
}

/**
 * Edge Case 6: Settings.throwOnInvalid with try-catch
 * ✅ CORRECT - Opt-in exception mode with proper error handling
 */
function parseWithThrowMode(input: string): DateTime | null {
  const previous = Settings.throwOnInvalid;
  Settings.throwOnInvalid = true;

  try {
    const dt = DateTime.fromISO(input);
    return dt;
  } catch (error) {
    console.error('Parse failed:', error);
    return null;
  } finally {
    Settings.throwOnInvalid = previous;
  }
}

/**
 * Edge Case 7: Settings.throwOnInvalid without try-catch
 * ❌ INCORRECT - Exception mode enabled but no try-catch
 * Should be treated as missing error handling
 */
function parseWithThrowModeUnsafe(input: string): DateTime {
  Settings.throwOnInvalid = true;
  const dt = DateTime.fromISO(input); // Could throw, no try-catch
  return dt;
}

/**
 * Edge Case 8: Validation through assertion
 * May or may not be detected depending on analyzer sophistication
 */
function parseWithAssertion(input: string): DateTime {
  const dt = DateTime.fromISO(input);
  console.assert(dt.isValid, 'Date must be valid');
  return dt;
}

/**
 * Edge Case 9: Validation in ternary operator
 * ✅ CORRECT - Inline validation
 */
function parseWithTernary(input: string): string {
  const dt = DateTime.fromISO(input);
  return dt.isValid ? dt.toISO() : 'Invalid date';
}

/**
 * Edge Case 10: Validation via optional chaining (if TypeScript)
 * Alternative pattern that checks validity
 */
function parseWithOptionalChaining(input: string): string | null {
  const dt = DateTime.fromISO(input);
  return dt.isValid ? dt.toISO() : null;
}

/**
 * Edge Case 11: Invalid DateTime propagation
 * ❌ INCORRECT - Operations on invalid DateTime
 */
function calculateWithInvalid(input: string): number {
  const dt = DateTime.fromISO(input);
  // No validation - if dt is invalid, operations still execute
  const future = dt.plus({ days: 7 });
  const diff = future.diff(DateTime.now(), 'hours');
  return diff.hours; // Returns NaN if dt was invalid
}

/**
 * Edge Case 12: Validation in loop
 * ✅ CORRECT - Validates each parsed date
 */
function parseDateArray(inputs: string[]): DateTime[] {
  const results: DateTime[] = [];
  for (const input of inputs) {
    const dt = DateTime.fromISO(input);
    if (dt.isValid) {
      results.push(dt);
    }
  }
  return results;
}

/**
 * Edge Case 13: Partial validation
 * ❌ INCORRECT - Uses result even after detecting invalidity
 */
function parseWithPartialValidation(input: string): string {
  const dt = DateTime.fromISO(input);
  if (!dt.isValid) {
    console.warn('Invalid date, using anyway');
  }
  return dt.toFormat('yyyy-MM-dd'); // Still uses invalid date
}

/**
 * Edge Case 14: Validation in callback
 * Detection across callback boundaries is challenging
 */
function parseAsync(input: string, callback: (dt: DateTime | null) => void): void {
  const dt = DateTime.fromISO(input);
  if (dt.isValid) {
    callback(dt);
  } else {
    callback(null);
  }
}

/**
 * Edge Case 15: Framework-style validation (e.g., Zod)
 * External validation libraries not tracked by analyzer
 */
interface DateInput {
  dateString: string;
}

function parseWithFrameworkValidation(input: DateInput): DateTime {
  // Assume framework validates input.dateString before this function
  const dt = DateTime.fromISO(input.dateString);
  return dt; // No validation here - framework handles it
}
