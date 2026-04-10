/**
 * Luxon Fixtures: Proper Validation Patterns
 *
 * These examples demonstrate CORRECT usage of Luxon DateTime parsing
 * with proper .isValid checks. Should NOT trigger violations.
 */

import { DateTime } from 'luxon';

/**
 * Example 1: fromISO with validation
 * ✅ CORRECT - Checks isValid before using result
 */
function parseISODate(input: string): DateTime | null {
  const dt = DateTime.fromISO(input);
  if (!dt.isValid) {
    console.error('Invalid ISO date:', dt.invalidReason);
    return null;
  }
  return dt;
}

/**
 * Example 2: fromFormat with validation and error details
 * ✅ CORRECT - Uses invalidReason and invalidExplanation
 */
function parseCustomFormat(input: string, format: string): DateTime {
  const dt = DateTime.fromFormat(input, format);
  if (!dt.isValid) {
    throw new Error(`Parse error: ${dt.invalidReason} - ${dt.invalidExplanation}`);
  }
  return dt;
}

/**
 * Example 3: fromSQL with validation
 * ✅ CORRECT - Validates before database operations
 */
async function parseSQLTimestamp(sqlDate: string) {
  const dt = DateTime.fromSQL(sqlDate);
  if (!dt.isValid) {
    throw new Error('Invalid SQL date format');
  }
  return dt.toISO();
}

/**
 * Example 4: fromHTTP with validation
 * ✅ CORRECT - Validates HTTP header dates
 */
function parseHTTPDate(headerDate: string): number {
  const dt = DateTime.fromHTTP(headerDate);
  if (!dt.isValid) {
    console.warn('Invalid HTTP date, using current time');
    return Date.now();
  }
  return dt.toMillis();
}

/**
 * Example 5: fromRFC2822 with validation
 * ✅ CORRECT - Validates RFC2822 dates
 */
function parseEmailDate(rfcDate: string): string {
  const dt = DateTime.fromRFC2822(rfcDate);
  if (!dt.isValid) {
    return 'Unknown date';
  }
  return dt.toLocaleString(DateTime.DATETIME_MED);
}

/**
 * Example 6: fromObject with validation
 * ✅ CORRECT - Validates object-based dates
 */
function createDate(year: number, month: number, day: number): DateTime | null {
  const dt = DateTime.fromObject({ year, month, day });
  if (!dt.isValid) {
    console.error('Invalid calendar date:', dt.invalidReason);
    return null;
  }
  return dt;
}

/**
 * Example 7: Multiple format attempts with validation
 * ✅ CORRECT - Tries multiple formats, validates each
 */
function parseFlexibleDate(input: string): DateTime | null {
  let dt = DateTime.fromISO(input);
  if (dt.isValid) return dt;

  dt = DateTime.fromFormat(input, 'MM/dd/yyyy');
  if (dt.isValid) return dt;

  dt = DateTime.fromFormat(input, 'yyyy-MM-dd');
  if (dt.isValid) return dt;

  console.error('Could not parse date in any format');
  return null;
}

/**
 * Example 8: Validation in conditional
 * ✅ CORRECT - Uses isValid in conditional logic
 */
function formatDateOrDefault(input: string): string {
  const dt = DateTime.fromISO(input);
  return dt.isValid ? dt.toFormat('yyyy-MM-dd') : 'Invalid date';
}

/**
 * Example 9: Early return pattern
 * ✅ CORRECT - Returns early if invalid
 */
function processDate(input: string): void {
  const dt = DateTime.fromISO(input);
  if (!dt.isValid) {
    return;
  }

  // Safe to use dt here
  console.log('Parsed date:', dt.toISO());
}

/**
 * Example 10: Validation with Settings.throwOnInvalid
 * ✅ CORRECT - Uses opt-in exception mode with try-catch
 */
function parseWithExceptions(input: string): DateTime {
  const originalSetting = DateTime.throwOnInvalid;
  DateTime.throwOnInvalid = true;

  try {
    const dt = DateTime.fromISO(input);
    return dt;
  } catch (error) {
    console.error('Parse error:', error);
    throw error;
  } finally {
    DateTime.throwOnInvalid = originalSetting;
  }
}
