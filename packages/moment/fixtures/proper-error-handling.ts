/**
 * Fixture: Proper error handling for moment.js
 *
 * This file demonstrates CORRECT usage of moment with isValid() checks.
 * Should produce ZERO violations.
 */

import moment from 'moment';

/**
 * Properly checks isValid() after parsing user input
 */
function parseUserDateSafe(dateString: string): string {
  const parsed = moment(dateString, 'YYYY-MM-DD');

  // ✅ GOOD: Check isValid() before using the result
  if (!parsed.isValid()) {
    throw new Error('Invalid date format');
  }

  return parsed.format('YYYY-MM-DD');
}

/**
 * Properly checks isValid() for UTC parsing
 */
function parseUTCDateSafe(dateString: string): Date {
  const parsed = moment.utc(dateString);

  // ✅ GOOD: Check isValid() before converting
  if (!parsed.isValid()) {
    throw new Error('Invalid UTC date');
  }

  return parsed.toDate();
}

/**
 * Safely switches locale with validation
 */
function setUserLocaleSafe(userLocale: string): void {
  const ALLOWED_LOCALES = ['en', 'fr', 'de', 'es', 'ja', 'zh-cn'];

  // ✅ GOOD: Validate against allowlist before using
  if (!ALLOWED_LOCALES.includes(userLocale)) {
    throw new Error(`Invalid locale: ${userLocale}`);
  }

  moment.locale(userLocale);
}

/**
 * Multiple checks in sequence
 */
function processUserDates(startDate: string, endDate: string): number {
  const start = moment(startDate, 'YYYY-MM-DD', true); // strict mode
  const end = moment(endDate, 'YYYY-MM-DD', true);

  // ✅ GOOD: Check both dates
  if (!start.isValid()) {
    throw new Error('Invalid start date');
  }

  if (!end.isValid()) {
    throw new Error('Invalid end date');
  }

  return end.diff(start, 'days');
}

/**
 * Using literal dates (no user input) - no check needed
 */
function getLiteralDate(): string {
  // ✅ GOOD: Literal input is safe, no check needed
  const date = moment('2023-01-15');
  return date.format('YYYY-MM-DD');
}

/**
 * Checking validity in conditional
 */
function tryParseDate(input: string): moment.Moment | null {
  const parsed = moment(input, 'YYYY-MM-DD');

  // ✅ GOOD: Returns null if invalid
  return parsed.isValid() ? parsed : null;
}
