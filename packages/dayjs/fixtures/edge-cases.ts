/**
 * Edge cases for Day.js validation detection
 * Tests various patterns that might bypass validation
 */

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

/**
 * Edge case: Permissive parsing
 * Day.js may parse invalid dates as valid (e.g., Jan 33 → Feb 2)
 */
export function testPermissiveParsing(): void {
  const date = dayjs('2022-01-33'); // Invalid day
  if (!date.isValid()) {
    // This won't trigger - dayjs parses it as 2022-02-02
    console.error('Invalid date');
  }
  console.log(date.format()); // Outputs: 2022-02-02
}

/**
 * ❌ VIOLATION: Inline usage without validation
 */
export function inlineUsage(input: string): string {
  return dayjs(input).format('YYYY-MM-DD');
}

/**
 * Proper: Strict mode with validation
 */
export function strictValidation(input: string): string {
  const date = dayjs(input, 'YYYY-MM-DD', true);

  if (!date.isValid()) {
    throw new Error('Invalid date format');
  }

  return date.format();
}

/**
 * ❌ VIOLATION: No validation even with strict parsing
 */
export function strictNoValidation(input: string): string {
  const date = dayjs(input, 'YYYY-MM-DD', true);
  // Missing: validation check
  return date.format();
}

/**
 * Edge case: Conditional validation (may or may not be proper)
 */
export function conditionalValidation(input: string, strict: boolean): string {
  const date = dayjs(input);

  if (strict && !date.isValid()) {
    throw new Error('Invalid date');
  }

  return date.format();
}

/**
 * ❌ VIOLATION: Using result of dayjs() directly in expression
 */
export function directExpression(input: string): number {
  return dayjs(input).valueOf();
}

/**
 * Edge case: Validation in separate function
 */
export function validateDate(date: dayjs.Dayjs): void {
  if (!date.isValid()) {
    throw new Error('Invalid date');
  }
}

export function useWithExternalValidation(input: string): string {
  const date = dayjs(input);
  validateDate(date); // Validation delegated
  return date.format();
}

/**
 * ❌ VIOLATION: Chained method calls without validation
 */
export function chainedCalls(input: string): string {
  return dayjs(input)
    .add(1, 'day')
    .subtract(1, 'month')
    .format('YYYY-MM-DD');
}

/**
 * Edge case: Multiple dayjs calls in one statement
 */
export function multipleCalls(start: string, end: string): number {
  const s = dayjs(start);
  const e = dayjs(end);

  if (!s.isValid() || !e.isValid()) {
    throw new Error('Invalid dates');
  }

  return e.diff(s, 'day');
}
