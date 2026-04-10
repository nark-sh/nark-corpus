/**
 * Luxon Fixtures: Missing Validation Patterns
 *
 * These examples demonstrate INCORRECT usage of Luxon DateTime parsing
 * WITHOUT proper .isValid checks. Should trigger WARNING violations.
 */

import { DateTime } from 'luxon';

/**
 * Example 1: fromISO without validation
 * ❌ INCORRECT - No isValid check, direct usage
 */
function parseISODateUnsafe(input: string): string {
  const dt = DateTime.fromISO(input);
  return dt.toFormat('yyyy-MM-dd'); // Returns "Invalid DateTime" if input was bad
}

/**
 * Example 2: fromFormat without validation
 * ❌ INCORRECT - Missing validation before formatting
 */
function parseCustomFormatUnsafe(input: string, format: string): DateTime {
  const dt = DateTime.fromFormat(input, format);
  return dt; // Returns invalid DateTime if format doesn't match
}

/**
 * Example 3: fromSQL without validation
 * ❌ INCORRECT - Direct usage in calculations
 */
async function parseSQLTimestampUnsafe(sqlDate: string): Promise<number> {
  const dt = DateTime.fromSQL(sqlDate);
  return dt.toMillis(); // Returns NaN if invalid
}

/**
 * Example 4: fromHTTP without validation
 * ❌ INCORRECT - Using result directly
 */
function parseHTTPDateUnsafe(headerDate: string): Date {
  const dt = DateTime.fromHTTP(headerDate);
  return dt.toJSDate(); // Returns Invalid Date if parsing failed
}

/**
 * Example 5: fromRFC2822 without validation
 * ❌ INCORRECT - No validation before display
 */
function parseEmailDateUnsafe(rfcDate: string): string {
  const dt = DateTime.fromRFC2822(rfcDate);
  return dt.toLocaleString(); // Returns empty string if invalid
}

/**
 * Example 6: fromObject without validation
 * ❌ INCORRECT - Direct usage with user input
 */
function createDateUnsafe(year: number, month: number, day: number): string {
  const dt = DateTime.fromObject({ year, month, day });
  return dt.toISO(); // Returns null if invalid
}

/**
 * Example 7: Chained operations without validation
 * ❌ INCORRECT - Operations on potentially invalid DateTime
 */
function addDaysUnsafe(input: string, days: number): string {
  const dt = DateTime.fromISO(input);
  const result = dt.plus({ days }); // If dt is invalid, result is also invalid
  return result.toFormat('MM/dd/yyyy'); // Returns "Invalid DateTime"
}

/**
 * Example 8: fromISO in calculation without validation
 * ❌ INCORRECT - Using parsed date in math operations
 */
function calculateDaysAgoUnsafe(dateString: string): number {
  const dt = DateTime.fromISO(dateString);
  const now = DateTime.now();
  const diff = now.diff(dt, 'days');
  return diff.days; // Returns NaN if dt is invalid
}

/**
 * Example 9: fromFormat in comparison without validation
 * ❌ INCORRECT - Comparing potentially invalid DateTime
 */
function isBeforeToday(input: string, format: string): boolean {
  const dt = DateTime.fromFormat(input, format);
  return dt < DateTime.now(); // Comparison with invalid DateTime returns false
}

/**
 * Example 10: Multiple parsing without validation
 * ❌ INCORRECT - No validation on any parse attempt
 */
function parseMultipleFormatsUnsafe(input: string): DateTime {
  const iso = DateTime.fromISO(input);
  const custom = DateTime.fromFormat(input, 'MM/dd/yyyy');
  return iso.isValid ? iso : custom; // Only checks first one, not second
}

/**
 * Example 11: fromSQL in database query
 * ❌ INCORRECT - Using invalid date in database operations
 */
async function queryByDateUnsafe(dateStr: string): Promise<any[]> {
  const dt = DateTime.fromSQL(dateStr);
  const isoDate = dt.toISO(); // Could be null
  // Database query with potentially null date
  return []; // Placeholder
}

/**
 * Example 12: fromObject with user data
 * ❌ INCORRECT - Direct usage of user-provided date components
 */
function createUserDate(userData: any): DateTime {
  const dt = DateTime.fromObject({
    year: userData.year,
    month: userData.month,
    day: userData.day
  });
  return dt; // Returns invalid DateTime if values are out of range
}

/**
 * Example 13: fromISO in API response
 * ❌ INCORRECT - Returning potentially invalid date to API
 */
function formatForAPI(input: string): { date: string } {
  const dt = DateTime.fromISO(input);
  return {
    date: dt.toISO() // Could be null
  };
}

/**
 * Example 14: fromFormat in timezone conversion
 * ❌ INCORRECT - Converting potentially invalid date
 */
function convertToUTC(input: string, format: string): string {
  const dt = DateTime.fromFormat(input, format);
  return dt.setZone('UTC').toISO(); // Returns null if dt is invalid
}

/**
 * Example 15: fromHTTP in cache key
 * ❌ INCORRECT - Using invalid date in cache logic
 */
function getCacheKey(headerDate: string): string {
  const dt = DateTime.fromHTTP(headerDate);
  return `cache_${dt.toMillis()}`; // Returns "cache_NaN" if invalid
}
