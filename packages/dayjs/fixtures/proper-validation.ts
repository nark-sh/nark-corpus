/**
 * Proper validation pattern for Day.js
 * Should NOT trigger violations (no error handling needed since no exceptions thrown)
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

/**
 * Proper pattern: Check .isValid() after parsing
 */
export function parseDate(input: string): string {
  const date = dayjs(input);

  if (!date.isValid()) {
    throw new Error('Invalid date input');
  }

  return date.format('YYYY-MM-DD');
}

/**
 * Proper pattern: UTC parsing with validation
 */
export function parseDateUTC(input: string): string {
  const date = dayjs.utc(input);

  if (!date.isValid()) {
    throw new Error('Invalid UTC date');
  }

  return date.format();
}

/**
 * Proper pattern: Strict parsing with validation
 */
export function parseDateStrict(input: string, format: string): string {
  const date = dayjs(input, format, true);

  if (!date.isValid()) {
    throw new Error(`Invalid date for format ${format}`);
  }

  return date.format();
}

/**
 * Proper pattern: Multiple date validation
 */
export function parseDates(inputs: string[]): dayjs.Dayjs[] {
  const results: dayjs.Dayjs[] = [];

  for (const input of inputs) {
    const date = dayjs(input);
    if (date.isValid()) {
      results.push(date);
    } else {
      console.warn(`Skipping invalid date: ${input}`);
    }
  }

  return results;
}

/**
 * Proper pattern: Return type indicates validity
 */
export function parseDateSafe(input: string): dayjs.Dayjs | null {
  const date = dayjs(input);
  return date.isValid() ? date : null;
}
