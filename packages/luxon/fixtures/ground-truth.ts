/**
 * Luxon Ground-Truth Fixtures
 *
 * Tests for postconditions that involve THROWS (not just returns-invalid pattern).
 * The returns-invalid pattern (fromISO, fromFormat, fromSQL, etc.) is covered in
 * missing-validation.ts and proper-validation.ts.
 *
 * This file focuses on the throw-based error contracts:
 *   - frommillis-non-number-throws
 *   - fromseconds-non-number-throws
 *   - fromobject-conflicting-specification
 *   - fromformat-missing-args
 *   - startof-invalid-unit
 *   - endof-invalid-unit
 *   - min-non-datetime-throws
 *   - max-non-datetime-throws
 *   - set-conflicting-specification (added 2026-04-20)
 *   - diff-invalid-unit (added 2026-04-20)
 *   - duration-fromobject-non-object-throws (added 2026-04-20)
 */

import { DateTime, Duration } from 'luxon';

// ═══════════════════════════════════════════════════════════════════════════════
// DateTime.fromMillis — throws for non-number input
// ═══════════════════════════════════════════════════════════════════════════════

// @expect-violation: frommillis-non-number-throws
// ❌ SHOULD_FIRE — fromMillis called without try-catch; throws if argument is string/null/undefined
// SHOULD_FIRE: frommillis-non-number-throws — fromMillis called without try-catch
async function fromMillisNoTryCatch(timestampMs: string | number): Promise<string> {
  const dt = DateTime.fromMillis(timestampMs as number); // throws if string
  return dt.toISO() ?? 'invalid';
}

// @expect-clean
// ✅ SHOULD_NOT_FIRE — fromMillis with proper validation and try-catch
async function fromMillisWithValidation(timestampMs: unknown): Promise<string> {
  const ts = Number(timestampMs);
  if (!Number.isFinite(ts)) {
    throw new Error(`Invalid timestamp: ${timestampMs}`);
  }
  try {
    const dt = DateTime.fromMillis(ts);
    if (!dt.isValid) {
      throw new Error(`Timestamp out of range: ${ts}`);
    }
    return dt.toISO() ?? '';
  } catch (error) {
    throw new Error(`Failed to create DateTime: ${error}`);
  }
}

// @expect-clean
// ✅ SHOULD_NOT_FIRE — fromMillis wrapped in try-catch
async function fromMillisWithTryCatch(timestampMs: number): Promise<string> {
  try {
    const dt = DateTime.fromMillis(timestampMs);
    return dt.toISO() ?? 'invalid';
  } catch (error) {
    throw new Error(`Failed to parse timestamp: ${error}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DateTime.fromSeconds — throws for non-number input
// ═══════════════════════════════════════════════════════════════════════════════

// @expect-violation: fromseconds-non-number-throws
// ❌ SHOULD_FIRE — fromSeconds called without try-catch; throws if argument is string/null/undefined
async function fromSecondsNoTryCatch(expiresAt: string | number): Promise<boolean> {
  const dt = DateTime.fromSeconds(expiresAt as number); // throws if string
  return dt.valueOf() > Date.now();
}

// @expect-clean
// ✅ SHOULD_NOT_FIRE — fromSeconds with input coercion and try-catch
async function fromSecondsWithValidation(expiresAt: unknown): Promise<boolean> {
  const secs = Number(expiresAt);
  if (!Number.isFinite(secs)) {
    return false; // treat as expired/invalid
  }
  try {
    const dt = DateTime.fromSeconds(secs);
    return dt.isValid && dt.valueOf() > Date.now();
  } catch (error) {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DateTime.fromObject — throws ConflictingSpecificationError for mixed calendar systems
// ═══════════════════════════════════════════════════════════════════════════════

// @expect-violation: fromobject-conflicting-specification
// ❌ SHOULD_FIRE — mixing weekYear with month/day throws ConflictingSpecificationError
function fromObjectConflictingWeek(weekYear: number, weekNumber: number, month: number): DateTime {
  return DateTime.fromObject({ weekYear, weekNumber, month, day: 1 }); // throws!
}

// @expect-violation: fromobject-conflicting-specification
// ❌ SHOULD_FIRE — mixing ordinal with month/day throws ConflictingSpecificationError
function fromObjectConflictingOrdinal(year: number, ordinal: number, month: number): DateTime {
  return DateTime.fromObject({ year, ordinal, month }); // throws!
}

// @expect-clean
// ✅ SHOULD_NOT_FIRE — Gregorian only (no mixing)
function fromObjectGregorianOnly(year: number, month: number, day: number): DateTime {
  try {
    return DateTime.fromObject({ year, month, day });
  } catch (error) {
    throw new Error(`Failed to create DateTime: ${error}`);
  }
}

// @expect-clean
// ✅ SHOULD_NOT_FIRE — ISO week date only (no mixing)
function fromObjectWeekDateOnly(weekYear: number, weekNumber: number, weekday: number): DateTime {
  try {
    return DateTime.fromObject({ weekYear, weekNumber, weekday });
  } catch (error) {
    throw new Error(`Failed to create week-based DateTime: ${error}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DateTime.fromFormat — throws if text or format argument is undefined
// ═══════════════════════════════════════════════════════════════════════════════

// @expect-violation: fromformat-missing-args
// ❌ SHOULD_FIRE — format argument may be undefined (from config lookup); throws
function fromFormatWithMaybeUndefinedFormat(input: string, format: string | undefined): DateTime {
  return DateTime.fromFormat(input, format!); // throws if format is undefined
}

// @expect-clean
// ✅ SHOULD_NOT_FIRE — validate format before use
function fromFormatWithValidatedArgs(input: string, format: string | undefined): DateTime {
  if (!format) {
    throw new Error('Date format is required');
  }
  try {
    const dt = DateTime.fromFormat(input, format);
    return dt;
  } catch (error) {
    throw new Error(`Failed to parse date: ${error}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DateTime.startOf — throws InvalidUnitError for unrecognized unit strings
// ═══════════════════════════════════════════════════════════════════════════════

// @expect-violation: startof-invalid-unit
// ❌ SHOULD_FIRE — unit comes from user input without validation; throws for 'date', 'min', etc.
function startOfWithDynamicUnit(dt: DateTime, unit: string): DateTime {
  return dt.startOf(unit as 'day'); // throws if unit is 'date' or 'min'
}

// @expect-clean
// ✅ SHOULD_NOT_FIRE — validate unit against allowed values, wrapped in try-catch
function startOfWithValidatedUnit(dt: DateTime, unit: string): DateTime {
  const VALID_UNITS = ['year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond'];
  if (!VALID_UNITS.includes(unit)) {
    throw new Error(`Invalid date unit: ${unit}. Valid units: ${VALID_UNITS.join(', ')}`);
  }
  try {
    return dt.startOf(unit as 'day');
  } catch (error) {
    throw new Error(`Failed to compute startOf(${unit}): ${error}`);
  }
}

// @expect-clean
// ✅ SHOULD_NOT_FIRE — hardcoded valid unit, wrapped in try-catch
function startOfCurrentDay(): DateTime {
  try {
    return DateTime.now().startOf('day');
  } catch (error) {
    throw new Error(`Failed to compute startOf(day): ${error}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DateTime.endOf — throws InvalidUnitError for unrecognized unit strings
// ═══════════════════════════════════════════════════════════════════════════════

// @expect-violation: endof-invalid-unit
// ❌ SHOULD_FIRE — unit comes from external source without validation
function endOfWithDynamicUnit(dt: DateTime, unit: string): DateTime {
  return dt.endOf(unit as 'month'); // throws for 'date', 'secs', etc.
}

// @expect-clean
// ✅ SHOULD_NOT_FIRE — hardcoded valid unit, wrapped in try-catch
function endOfCurrentMonth(): DateTime {
  try {
    return DateTime.now().endOf('month');
  } catch (error) {
    throw new Error(`Failed to compute endOf(month): ${error}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DateTime.min — throws if any argument is not a DateTime instance
// ═══════════════════════════════════════════════════════════════════════════════

// @expect-violation: min-non-datetime-throws
// ❌ SHOULD_FIRE — passing JS Date objects directly; throws if any arg is not a DateTime
function findEarliestDateUnsafe(dates: (DateTime | Date)[]): DateTime {
  return DateTime.min(...dates as DateTime[]); // throws if any Date object passed
}

// @expect-clean
// ✅ SHOULD_NOT_FIRE — convert all to DateTime instances first, with try-catch
function findEarliestDateSafe(dates: (DateTime | Date)[]): DateTime | undefined {
  const dateTimes = dates.map(d => {
    if (DateTime.isDateTime(d)) return d;
    return DateTime.fromJSDate(d as Date);
  }).filter(dt => dt.isValid);

  if (dateTimes.length === 0) return undefined;
  try {
    return DateTime.min(...dateTimes);
  } catch (error) {
    return undefined;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DateTime.max — throws if any argument is not a DateTime instance
// ═══════════════════════════════════════════════════════════════════════════════

// @expect-violation: max-non-datetime-throws
// ❌ SHOULD_FIRE — passing mixed types; throws for non-DateTime arguments
function findLatestDateUnsafe(...dates: (DateTime | Date | number)[]): DateTime {
  return DateTime.max(...dates as DateTime[]); // throws for Date or number args
}

// @expect-clean
// ✅ SHOULD_NOT_FIRE — all args are guaranteed DateTime instances, with try-catch
function findLatestOfDateTimes(dt1: DateTime, dt2: DateTime): DateTime {
  if (!DateTime.isDateTime(dt1) || !DateTime.isDateTime(dt2)) {
    throw new Error('Both arguments must be DateTime instances');
  }
  try {
    return DateTime.max(dt1, dt2);
  } catch (error) {
    throw new Error(`Failed to find max DateTime: ${error}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DateTime.set — throws ConflictingSpecificationError for mixed calendar systems
// ═══════════════════════════════════════════════════════════════════════════════

// @expect-violation: set-conflicting-specification
// ❌ SHOULD_FIRE — mixing weekYear with month; set() throws ConflictingSpecificationError
function setMixedCalendarFieldsWeek(dt: DateTime, weekYear: number, month: number): DateTime {
  return dt.set({ weekYear, month }); // throws! can't mix ISO week year with Gregorian month
}

// @expect-violation: set-conflicting-specification
// ❌ SHOULD_FIRE — mixing ordinal with month/day; set() throws ConflictingSpecificationError
function setMixedCalendarFieldsOrdinal(dt: DateTime, ordinal: number, month: number): DateTime {
  return dt.set({ ordinal, month }); // throws! can't mix ordinal with Gregorian month/day
}

// @expect-clean
// ✅ SHOULD_NOT_FIRE — set only Gregorian fields, wrapped in try-catch
function setGregorianFieldsSafe(dt: DateTime, hour: number, minute: number): DateTime {
  try {
    return dt.set({ hour, minute });
  } catch (error) {
    throw new Error(`Failed to set DateTime fields: ${error}`);
  }
}

// @expect-clean
// ✅ SHOULD_NOT_FIRE — set only week-based fields, wrapped in try-catch
function setWeekFieldsSafe(dt: DateTime, weekNumber: number): DateTime {
  try {
    return dt.set({ weekNumber });
  } catch (error) {
    throw new Error(`Failed to set week number: ${error}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DateTime.diff — throws InvalidUnitError for unrecognized unit strings
// ═══════════════════════════════════════════════════════════════════════════════

// @expect-violation: diff-invalid-unit
// ❌ SHOULD_FIRE — unit from user input without validation; throws for 'date', 'min', etc.
function diffWithDynamicUnit(start: DateTime, end: DateTime, unit: string): number {
  const duration = start.diff(end, unit as 'days'); // throws if unit is 'date' or 'min'
  return duration.valueOf();
}

// @expect-clean
// ✅ SHOULD_NOT_FIRE — validate unit before use, wrapped in try-catch
function diffWithValidatedUnit(start: DateTime, end: DateTime, unit: string): number {
  const VALID_UNITS = ['years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds', 'milliseconds'];
  if (!VALID_UNITS.includes(unit)) {
    throw new Error(`Invalid diff unit: ${unit}. Valid: ${VALID_UNITS.join(', ')}`);
  }
  try {
    const duration = start.diff(end, unit as 'days');
    return duration.valueOf();
  } catch (error) {
    throw new Error(`Failed to diff DateTimes: ${error}`);
  }
}

// @expect-clean
// ✅ SHOULD_NOT_FIRE — hardcoded valid units array, wrapped in try-catch
function getSubscriptionDaysRemaining(startDate: DateTime, endDate: DateTime): number {
  try {
    const duration = startDate.diff(endDate, ['months', 'days']);
    return duration.days;
  } catch (error) {
    throw new Error(`Failed to compute subscription period: ${error}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Duration.fromObject — throws InvalidArgumentError for null/non-object input
// ═══════════════════════════════════════════════════════════════════════════════

// @expect-violation: duration-fromobject-non-object-throws
// ❌ SHOULD_FIRE — Duration.fromObject called with potentially null/undefined; throws
function createDurationFromConfig(config: Record<string, unknown>): Duration {
  return Duration.fromObject(config.retryDelay as object); // throws if config.retryDelay is null/undefined
}

// @expect-clean
// ✅ SHOULD_NOT_FIRE — validate before calling Duration.fromObject, with try-catch
function createDurationFromConfigSafe(config: Record<string, unknown>): Duration {
  const delay = config.retryDelay;
  if (!delay || typeof delay !== 'object' || Array.isArray(delay)) {
    return Duration.fromMillis(1000); // default 1 second
  }
  try {
    return Duration.fromObject(delay as Record<string, number>);
  } catch (error) {
    throw new Error(`Invalid duration configuration: ${error}`);
  }
}

// @expect-clean
// ✅ SHOULD_NOT_FIRE — nullish coalescing to provide safe default, with try-catch
function parseDurationOrDefault(input: unknown): Duration {
  const durationObj = (typeof input === 'object' && input !== null) ? input : { milliseconds: 0 };
  try {
    return Duration.fromObject(durationObj as Record<string, number>);
  } catch (error) {
    throw new Error(`Failed to create Duration: ${error}`);
  }
}
