/**
 * Missing validation pattern for Day.js
 * Should trigger violations - using dayjs without checking .isValid()
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

/**
 * ❌ VIOLATION: No .isValid() check after parsing
 * Invalid dates will cause incorrect calculations
 */
export function parseDate(input: string): string {
  const date = dayjs(input);
  // Missing: if (!date.isValid()) { ... }
  return date.format('YYYY-MM-DD');
}

/**
 * ❌ VIOLATION: UTC parsing without validation
 */
export function parseDateUTC(input: string): string {
  const date = dayjs.utc(input);
  // Missing: validation check
  return date.format();
}

/**
 * ❌ VIOLATION: Direct usage without validation
 */
export function calculateAge(birthdate: string): number {
  const birth = dayjs(birthdate);
  const now = dayjs();
  // Missing: validation check
  return now.diff(birth, 'year');
}

/**
 * ❌ VIOLATION: Using parsed date in calculations without checking
 */
export function addDays(dateStr: string, days: number): string {
  const date = dayjs(dateStr);
  // Missing: validation check
  return date.add(days, 'day').format();
}

/**
 * ❌ VIOLATION: Array processing without validation
 */
export function formatDates(inputs: string[]): string[] {
  return inputs.map(input => {
    const date = dayjs(input);
    // Missing: validation check
    return date.format('YYYY-MM-DD');
  });
}

/**
 * ❌ VIOLATION: Chained operations without validation
 */
export function getMonthStart(dateStr: string): string {
  const date = dayjs(dateStr);
  // Missing: validation check
  return date.startOf('month').format('YYYY-MM-DD');
}

/**
 * ❌ VIOLATION: Comparison without validation
 */
export function isDateBefore(date1: string, date2: string): boolean {
  const d1 = dayjs(date1);
  const d2 = dayjs(date2);
  // Missing: validation checks
  return d1.isBefore(d2);
}
