/**
 * Instance Usage for date-fns
 */

import { parse, format, isValid } from 'date-fns';

class DateService {
  // ⚠️ No validation
  parse(dateString: string): Date {
    return parse(dateString, 'yyyy-MM-dd', new Date());
  }
  
  // ⚠️ No validation
  format(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  }
}

// ⚠️ Module-level parsing without validation
const date = parse('2024-01-01', 'yyyy-MM-dd', new Date());
format(date, 'yyyy-MM-dd');

export { DateService };
