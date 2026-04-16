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

dayjs.extend(utcPlugin);
dayjs.extend(timezonePlugin);

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
