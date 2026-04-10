/**
 * Missing date-fns Validation
 * Should produce WARNING violations
 */

import { parse, format } from 'date-fns';

// ⚠️ No validation after parse
function parseNoValidation(dateString: string): Date {
  const date = parse(dateString, 'yyyy-MM-dd', new Date());
  return date; // ⚠️ Could be Invalid Date
}

// ⚠️ No validation before format
function formatNoValidation(date: Date): string {
  return format(date, 'yyyy-MM-dd'); // ⚠️ Could return 'Invalid Date'
}

// ⚠️ Using in calculations without validation
function addDaysNoValidation(dateString: string, days: number): number {
  const date = parse(dateString, 'yyyy-MM-dd', new Date());
  return date.getTime() + days * 86400000; // ⚠️ Could be NaN
}

export { parseNoValidation, formatNoValidation, addDaysNoValidation };
