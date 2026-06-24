/**
 * Ground-truth test fixtures for dayjs — timezone plugin postconditions
 * Added: 2026-04-11 (deepen-stream-2, pass 2)
 *
 * Tests the tz() postconditions added in depth pass:
 *   - tz-invalid-timezone-range-error
 *   - tz-setdefault-invalid-timezone
 *
 * IMPORTANT: Unlike other Day.js operations, dayjs.tz() and Dayjs.tz() throw
 * REAL exceptions (RangeError) for invalid timezone strings — not silent invalidity.
 * The dayjs timezone plugin calls Intl.DateTimeFormat({ timeZone: tz }) with no try-catch.
 */

import dayjs from 'dayjs';
import utcPlugin from 'dayjs/plugin/utc';
import timezonePlugin from 'dayjs/plugin/timezone';
import durationPlugin from 'dayjs/plugin/duration';

dayjs.extend(utcPlugin);
dayjs.extend(timezonePlugin);
dayjs.extend(durationPlugin);

// ============================================================
// VIOLATION CASES — scanner SHOULD flag these
// ============================================================

// @expect-violation: tz-invalid-timezone-range-error
// Missing try-catch around dayjs.tz() with user-supplied timezone string.
// If timezone is invalid IANA string (e.g., "EST", "PST"), throws RangeError.
export async function parseDateInTimezoneNoErrorHandling(
  dateStr: string,
  timezone: string
): Promise<string> {
  const d = dayjs.tz(dateStr, timezone);
  return d.format('YYYY-MM-DD HH:mm:ss');
}

// @expect-violation: tz-invalid-timezone-range-error
// Calling .tz() on an existing dayjs object without try-catch.
// Timezone conversion throws RangeError for invalid IANA identifiers.
export async function convertTimezoneNoErrorHandling(
  dateStr: string,
  targetTz: string
): Promise<string> {
  const d = dayjs(dateStr).tz(targetTz);
  return d.toISOString();
}

// @expect-violation: tz-invalid-timezone-range-error
// Chained: dayjs.utc().tz() — timezone conversion throws for invalid IANA tz.
export async function convertUtcToTimezoneNoErrorHandling(
  isoString: string,
  tz: string
): Promise<string> {
  return dayjs.utc(isoString).tz(tz).format();
}

// ============================================================
// CLEAN CASES — scanner should NOT flag these
// ============================================================

// @expect-clean
// Proper error handling around dayjs.tz() — catches RangeError for invalid IANA tz.
export async function parseDateInTimezoneWithErrorHandling(
  dateStr: string,
  timezone: string
): Promise<string | null> {
  try {
    const d = dayjs.tz(dateStr, timezone);
    if (!d.isValid()) {
      return null;
    }
    return d.format('YYYY-MM-DD HH:mm:ss');
  } catch (e) {
    if (e instanceof RangeError) {
      console.error(`Invalid timezone: ${timezone}`, e.message);
      return null;
    }
    throw e;
  }
}

// @expect-clean
// Pre-validate timezone using Intl.supportedValuesOf before calling dayjs.tz().
export async function parseDateInTimezoneWithValidation(
  dateStr: string,
  timezone: string
): Promise<string | null> {
  // Validate IANA timezone before passing to dayjs
  const validTimezones = Intl.supportedValuesOf('timeZone');
  if (!validTimezones.includes(timezone)) {
    throw new Error(`Invalid timezone: ${timezone}`);
  }
  const d = dayjs.tz(dateStr, timezone);
  return d.format('YYYY-MM-DD HH:mm:ss');
}

// @expect-clean
// Using a hardcoded known-valid IANA timezone — no user input, no runtime risk.
export async function convertToNewYorkTime(dateStr: string): Promise<string> {
  const d = dayjs.tz(dateStr, 'America/New_York');
  return d.format('YYYY-MM-DD HH:mm:ss');
}

// @expect-clean
// tz.setDefault with validated timezone.
export function setTimezoneDefaultSafely(timezone: string): void {
  // Validate before setting as default
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    dayjs.tz.setDefault(timezone);
  } catch (e) {
    if (e instanceof RangeError) {
      console.error(`Cannot set invalid default timezone: ${timezone}`);
      throw new Error(`Invalid IANA timezone: ${timezone}`);
    }
    throw e;
  }
}

// ============================================================
// toISOString() postconditions
// ============================================================

// @expect-violation: toisostring-invalid-date-throws
// No isValid() check before calling toISOString() on a user-supplied date string.
// If the string is invalid, dayjs() produces an invalid object and toISOString()
// throws RangeError: Invalid time value.
export async function serializeDateToISOStringNoValidation(
  dateStr: string
): Promise<string> {
  const d = dayjs(dateStr);
  return d.toISOString(); // throws if dateStr is invalid
}

// @expect-violation: toisostring-invalid-date-throws
// Parsing from API response without validation, then serializing to ISO string.
// Database store will crash if API returns a malformed timestamp field.
export async function storeApiTimestampNoValidation(
  apiResponseTimestamp: string
): Promise<{ iso: string }> {
  const parsed = dayjs(apiResponseTimestamp);
  return { iso: parsed.toISOString() }; // throws for invalid timestamp
}

// @expect-clean
// Using isValid() guard before calling toISOString() — safe pattern.
export async function serializeDateToISOStringSafe(
  dateStr: string
): Promise<string | null> {
  const d = dayjs(dateStr);
  if (!d.isValid()) {
    return null;
  }
  return d.toISOString();
}

// @expect-clean
// Using toJSON() as a safe alternative to toISOString() — toJSON() has isValid() guard
// in dayjs source and returns null for invalid dates instead of throwing.
export async function serializeDateToJSONSafe(
  dateStr: string
): Promise<string | null> {
  const d = dayjs(dateStr);
  return d.toJSON(); // null-safe — no throw for invalid dates
}

// ============================================================
// duration() postconditions
// ============================================================

// @expect-violation: duration-invalid-iso-string-silent-zero
// Passing a natural-language duration string to dayjs.duration() —
// does NOT match ISO 8601 format, silently produces 0ms duration.
// Subscription will appear expired immediately.
export async function createSubscriptionDurationFromString(
  durationStr: string
): Promise<number> {
  // durationStr might be "30 days" or "1 month" (natural language, not ISO 8601)
  const dur = dayjs.duration(durationStr);
  return dur.asMilliseconds(); // silently returns 0 for non-ISO strings
}

// @expect-violation: duration-invalid-iso-string-silent-zero
// Parsing trial period duration from config without validation.
// If config has "14d" instead of "P14D", trial expires immediately.
export async function getTrialExpiryDate(
  trialDurationStr: string
): Promise<string> {
  const dur = dayjs.duration(trialDurationStr); // "14d" → 0ms (silent)
  return dayjs().add(dur).toISOString();
}

// @expect-clean
// Validate that duration produces non-zero result, or pre-validate format.
export async function createSubscriptionDurationSafe(
  durationStr: string
): Promise<number | null> {
  const dur = dayjs.duration(durationStr);
  const ms = dur.asMilliseconds();
  // Guard against silent zero-duration from invalid ISO 8601 string
  if (ms === 0 && durationStr !== 'P0D' && durationStr !== 'PT0S' && durationStr !== 'P0DT0H0M0S') {
    console.error(`Invalid ISO 8601 duration string: ${durationStr}`);
    return null;
  }
  return ms;
}

// @expect-clean
// Using a hardcoded valid ISO 8601 duration string — no runtime parsing risk.
export async function getTrialExpiryDateHardcoded(): Promise<string> {
  const dur = dayjs.duration('P14D'); // 14 days in ISO 8601
  return dayjs().add(dur).toISOString();
}

// ============================================================
// dayjs() zero-argument — SHOULD NOT fire dayjs-invalid-date
// ============================================================
// dayjs() with NO arguments always returns the current time and is always valid.
// There is no user-supplied input, so requiring .isValid() is a false positive.
// Evidence: concern-20260421-dayjs-no-args-fp (195 FPs across ant-design, mantine, notesnook)

// @expect-clean
// dayjs() with no args — current time, always valid. Must NOT trigger dayjs-invalid-date.
export function getCurrentTime(): string {
  const now = dayjs();
  return now.format('YYYY-MM-DD');
}

// @expect-clean
// dayjs() no-args chained with .format() — still no-args, still always valid.
export function getCurrentTimeFormatted(): string {
  return dayjs().format('YYYY-MM-DD HH:mm:ss');
}

// @expect-clean
// dayjs() no-args used in a diff calculation (common pattern in age/duration calcs).
export function daysSinceDate(dateStr: string): number {
  const past = dayjs(dateStr);
  if (!past.isValid()) {
    throw new Error('Invalid date');
  }
  const now = dayjs(); // no-args: always valid, must NOT trigger dayjs-invalid-date
  return now.diff(past, 'day');
}

// @expect-violation: dayjs-invalid-date
// dayjs() WITH a string argument — user input may be invalid, should still fire.
export function formatUserDate(input: string): string {
  const d = dayjs(input); // has arg — may be invalid
  return d.format('YYYY-MM-DD');
}

// ============================================================
// humanize() postconditions (Duration plugin)
// Added 2026-06-24 (deepen-stream-3, pass 38)
// ============================================================
// Duration.humanize() internally calls dayjs().fromNow(), which is added by
// the relativeTime plugin. If only the duration plugin is extended, humanize
// throws TypeError: "fromNow is not a function".

// SHOULD_FIRE: humanize-missing-relativetime-plugin
// Caller assumes duration plugin alone provides humanize, but humanize
// requires relativeTime plugin too. Throws TypeError at runtime.
export function durationHumanizeMissingRelativeTime(ms: number): string {
  // NOTE: No try-catch; relativeTime not extended in this fixture context.
  const dur = dayjs.duration(ms);
  return dur.humanize(); // throws TypeError if relativeTime not loaded
}

// SHOULD_FIRE: humanize-missing-relativetime-plugin
// Common pattern: trial-period or subscription remaining-time display.
export function describeTrialRemaining(remainingMs: number): string {
  const remaining = dayjs.duration(remainingMs);
  return remaining.humanize(true); // "in 14 days" — but throws if no relativeTime
}

// @expect-clean
// Wrap humanize() in try-catch — handles missing-plugin TypeError safely.
export function durationHumanizeSafe(ms: number): string {
  try {
    const dur = dayjs.duration(ms);
    return dur.humanize();
  } catch (e) {
    if (e instanceof TypeError) {
      return `${Math.round(ms / 1000)}s`;
    }
    throw e;
  }
}
