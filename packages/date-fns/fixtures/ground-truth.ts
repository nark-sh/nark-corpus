/**
 * date-fns Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the date-fns contract spec (depth pass 2026-04-17).
 *
 * Key contract rules:
 *   - format(), formatDistance(), formatDistanceStrict(), formatDistanceToNow(),
 *     formatDistanceToNowStrict(), formatISO() all THROW RangeError("Invalid time value")
 *     on Invalid Date input. They must be protected by isValid() checks.
 *   - parse() RETURNS Invalid Date (does not throw) on malformed input.
 *     The isValid() check must happen AFTER parse(), BEFORE passing to formatters.
 *   - format() also throws RangeError for bad format tokens (YYYY vs yyyy).
 *   - isMatch() returns boolean for input mismatch; only throws for bad format strings.
 *
 * NOTE: date-fns is synchronous — these are synchronous throw patterns, not async.
 * The scanner's try-catch detection applies to synchronous throws as well.
 */

import {
  format,
  parse,
  formatDistance,
  formatDistanceStrict,
  formatDistanceToNow,
  formatDistanceToNowStrict,
  formatISO,
  isMatch,
  isValid,
} from 'date-fns';

// ─────────────────────────────────────────────────────────────────────────────
// 1. format() — missing isValid check (Invalid Date → throws RangeError)
// ─────────────────────────────────────────────────────────────────────────────

export function formatWithoutValidation(date: Date): string {
  // SHOULD_FIRE: format-invalid-date — format() throws RangeError on Invalid Date, no isValid check
  return format(date, 'yyyy-MM-dd');
}

export function formatWithValidation(date: Date): string {
  if (!isValid(date)) {
    throw new Error('Cannot format invalid date');
  }
  // SHOULD_NOT_FIRE: guarded by isValid() before format()
  return format(date, 'yyyy-MM-dd');
}

export function formatParsedDateUnsafe(userInput: string): string {
  const parsed = parse(userInput, 'MM/dd/yyyy', new Date());
  // SHOULD_FIRE: format-invalid-date — parse() may return Invalid Date, no isValid check before format()
  return format(parsed, 'yyyy-MM-dd');
}

export function formatParsedDateSafe(userInput: string): string | null {
  const parsed = parse(userInput, 'MM/dd/yyyy', new Date());
  if (!isValid(parsed)) {
    return null;
  }
  // SHOULD_NOT_FIRE: isValid() checked between parse and format
  return format(parsed, 'yyyy-MM-dd');
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. formatDistance() — missing isValid check on either date argument
// ─────────────────────────────────────────────────────────────────────────────

export function formatDistanceWithoutValidation(date: Date): string {
  // SHOULD_FIRE: formatDistance-invalid-date — no isValid check before formatDistance
  return formatDistance(date, new Date(), { addSuffix: true });
}

export function formatDistanceWithValidation(date: Date): string {
  if (!isValid(date)) {
    return 'unknown time';
  }
  // SHOULD_NOT_FIRE: guarded by isValid()
  return formatDistance(date, new Date(), { addSuffix: true });
}

export function formatDistanceBothDatesUnsafe(start: Date, end: Date): string {
  // SHOULD_FIRE: formatDistance-invalid-date — neither date validated before formatDistance
  return formatDistance(start, end);
}

export function formatDistanceBothDatesSafe(start: Date, end: Date): string {
  if (!isValid(start) || !isValid(end)) {
    throw new Error('Invalid date for distance calculation');
  }
  // SHOULD_NOT_FIRE: both dates validated
  return formatDistance(start, end);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. formatDistanceStrict() — missing isValid check
// ─────────────────────────────────────────────────────────────────────────────

export function formatDistanceStrictWithoutValidation(start: Date, end: Date): string {
  // SHOULD_FIRE: formatDistanceStrict-invalid-date — no isValid check
  return formatDistanceStrict(end, start);
}

export function formatDistanceStrictWithValidation(start: Date, end: Date): string {
  if (!isValid(start) || !isValid(end)) {
    throw new Error('Invalid date');
  }
  // SHOULD_NOT_FIRE: guarded
  return formatDistanceStrict(end, start);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. formatDistanceToNow() — missing isValid check
// ─────────────────────────────────────────────────────────────────────────────

export function formatDistanceToNowWithoutValidation(date: Date): string {
  // SHOULD_FIRE: formatDistanceToNow-invalid-date — no isValid check
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatDistanceToNowWithValidation(date: Date): string {
  if (!isValid(date)) {
    return 'never';
  }
  // SHOULD_NOT_FIRE: guarded
  return formatDistanceToNow(date, { addSuffix: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. formatDistanceToNowStrict() — missing isValid check
// ─────────────────────────────────────────────────────────────────────────────

export function formatDistanceToNowStrictWithoutValidation(date: Date): string {
  // SHOULD_FIRE: formatDistanceToNowStrict-invalid-date — no isValid check
  return formatDistanceToNowStrict(date);
}

export function formatDistanceToNowStrictWithValidation(date: Date): string {
  if (!isValid(date)) {
    return 'invalid';
  }
  // SHOULD_NOT_FIRE: guarded
  return formatDistanceToNowStrict(date);
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. formatISO() — missing isValid check
// ─────────────────────────────────────────────────────────────────────────────

export function formatISOWithoutValidation(date: Date): string {
  // SHOULD_FIRE: formatISO-invalid-date — no isValid check before formatISO
  return formatISO(date);
}

export function formatISOWithValidation(date: Date | null | undefined): string | null {
  if (!date || !isValid(date)) {
    return null;
  }
  // SHOULD_NOT_FIRE: guarded by null check and isValid()
  return formatISO(date);
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. parse() — returns Invalid Date (no throw), must be validated downstream
// ─────────────────────────────────────────────────────────────────────────────

export function parseWithoutValidation(userInput: string): Date {
  const date = parse(userInput, 'MM/dd/yyyy', new Date());
  // SHOULD_FIRE: parse-returns-invalid-date — returns Invalid Date without isValid check
  return date;
}

export function parseWithValidation(userInput: string): Date | null {
  const date = parse(userInput, 'MM/dd/yyyy', new Date());
  if (!isValid(date)) {
    return null;
  }
  // SHOULD_NOT_FIRE: checked with isValid() before returning
  return date;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. isMatch() — returns boolean for input mismatch; safe for validation
// ─────────────────────────────────────────────────────────────────────────────

export function validateDateFormat(userInput: string): boolean {
  // SHOULD_NOT_FIRE: isMatch() returns boolean, doesn't throw on input mismatch
  return isMatch(userInput, 'MM/dd/yyyy');
}

export function safeParseAfterMatch(userInput: string): Date | null {
  // SHOULD_NOT_FIRE: isMatch() safe, then parse + isValid check
  if (!isMatch(userInput, 'MM/dd/yyyy')) {
    return null;
  }
  return parse(userInput, 'MM/dd/yyyy', new Date());
}
