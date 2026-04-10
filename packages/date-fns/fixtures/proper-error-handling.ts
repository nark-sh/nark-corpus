/**
 * Proper date-fns Error Handling
 * Should produce 0 violations
 */

import { parse, format, isValid } from 'date-fns';

// ✅ Validate after parsing
function parseUserDate(dateString: string): Date | null {
  const date = parse(dateString, 'yyyy-MM-dd', new Date());
  
  if (\!isValid(date)) {
    console.error('Invalid date:', dateString);
    return null;
  }
  
  return date;
}

// ✅ Check before formatting
function formatUserDate(date: Date): string {
  if (\!isValid(date)) {
    throw new Error('Invalid date');
  }
  
  return format(date, 'yyyy-MM-dd');
}

// ✅ Validate before calculations
function addDaysToDate(dateString: string, days: number): Date | null {
  const date = parse(dateString, 'yyyy-MM-dd', new Date());
  
  if (\!isValid(date)) {
    return null;
  }
  
  date.setDate(date.getDate() + days);
  return date;
}

export { parseUserDate, formatUserDate, addDaysToDate };
