/**
 * Fixture: Missing error handling for moment.js
 *
 * This file demonstrates INCORRECT usage without isValid() checks.
 * Should produce MULTIPLE ERROR violations.
 */

import moment from 'moment';

/**
 * ❌ VIOLATION: No isValid() check after parsing user input
 */
function parseUserDateUnsafe(dateString: string): string {
  const parsed = moment(dateString);
  // ❌ Missing isValid() check
  return parsed.format('YYYY-MM-DD');
}

/**
 * ❌ VIOLATION: No isValid() check for UTC parsing
 */
function parseUTCDateUnsafe(dateString: string): Date {
  const parsed = moment.utc(dateString);
  // ❌ Missing isValid() check
  return parsed.toDate();
}

/**
 * ❌ VIOLATION: Direct use of user input in locale()
 */
function setUserLocaleUnsafe(userLocale: string): void {
  // ❌ CVE-2022-24785: Path traversal vulnerability
  moment.locale(userLocale);
}

/**
 * ❌ VIOLATION: Multiple operations without checking validity
 */
function calculateDateDiffUnsafe(start: string, end: string): number {
  const startDate = moment(start);
  const endDate = moment(end);
  // ❌ No isValid() checks before diff()
  return endDate.diff(startDate, 'days');
}

/**
 * ❌ VIOLATION: Chained operations without validity check
 */
function addDaysUnsafe(dateString: string, days: number): string {
  // ❌ No isValid() check
  return moment(dateString).add(days, 'days').format('YYYY-MM-DD');
}

/**
 * ❌ VIOLATION: Using user input with format specifier but no check
 */
function parseWithFormatUnsafe(input: string, format: string): string {
  const parsed = moment(input, format);
  // ❌ Missing isValid() check
  return parsed.format('LL');
}

/**
 * ❌ VIOLATION: Converting to native Date without check
 */
function toNativeDateUnsafe(dateString: string): Date {
  const parsed = moment(dateString);
  // ❌ Missing isValid() check before toDate()
  return parsed.toDate();
}

/**
 * ❌ VIOLATION: Using fromNow() without check
 */
function relativeTimeUnsafe(dateString: string): string {
  const parsed = moment(dateString);
  // ❌ Missing isValid() check
  return parsed.fromNow();
}

/**
 * ❌ VIOLATION: Comparison operations without check
 */
function isBeforeUnsafe(date1: string, date2: string): boolean {
  const m1 = moment(date1);
  const m2 = moment(date2);
  // ❌ No isValid() checks before isBefore()
  return m1.isBefore(m2);
}

/**
 * ❌ VIOLATION: Setting locale from request parameter
 */
function setLocaleFromRequest(req: { query: { locale: string } }): void {
  // ❌ CVE-2022-24785: Using req.query directly
  moment.locale(req.query.locale);
}

/**
 * ❌ VIOLATION: RFC2822 parsing without length validation
 */
function parseRFC2822Unsafe(input: string): moment.Moment {
  // ❌ CVE-2022-31129: ReDoS vulnerability with long input
  return moment(input, moment.RFC_2822);
}

/**
 * ❌ VIOLATION: Arithmetic without validation
 */
function subtractMonthsUnsafe(dateString: string): string {
  // ❌ No isValid() check
  return moment(dateString).subtract(1, 'months').format('YYYY-MM-DD');
}
