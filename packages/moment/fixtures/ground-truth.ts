/**
 * moment Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "moment"):
 *   - moment()          postconditions: moment-invalid-date
 *   - moment.utc()      postconditions: utc-invalid-date
 *   - moment.locale()   postconditions: locale-path-traversal
 *   - moment.parseZone() postconditions: parsezone-invalid-date
 *   - moment.unix()     postconditions: unix-nan-timestamp
 *   - moment.duration() postconditions: duration-nan-propagation
 *   - moment.defineLocale() postconditions: definelocale-path-traversal
 *   - moment.updateLocale() postconditions: updatelocale-path-traversal
 *   - Moment.format()   postconditions: format-invalid-date-string, format-redos-unvalidated-input
 *   - Moment.toISOString() postconditions: toisostring-null-for-invalid
 *   - Moment.fromNow()  postconditions: fromnow-invalid-date-string
 *   - Moment.from()     postconditions: from-invalid-date-string
 *   - Moment.add()      postconditions: add-noop-on-invalid, add-month-end-clamp
 *   - Moment.subtract() postconditions: subtract-noop-on-invalid
 *   - moment.min()      postconditions: min-invalid-moment-propagation
 *   - moment.max()      postconditions: max-invalid-moment-propagation
 *
 * Detection path: named/default import → ThrowingFunctionDetector fires moment() →
 *   ContractMatcher checks for isValid() guard → postcondition fires if absent
 * Note: moment is SYNCHRONOUS — no try-catch pattern, isValid() guard pattern instead
 */

import moment from 'moment';

// ─────────────────────────────────────────────────────────────────────────────
// 1. moment() — without isValid() check
// ─────────────────────────────────────────────────────────────────────────────

export function momentNoCatch(input: string): string {
  const m = moment(input);
  // SHOULD_NOT_FIRE: scanner gap — moment-invalid-date — moment() returns invalid object for bad input. No isValid() check.
  return m.format('YYYY-MM-DD');
}

export function momentWithIsValid(input: string): string {
  const m = moment(input);
  // SHOULD_NOT_FIRE: isValid() check satisfies the postcondition
  if (!m.isValid()) {
    throw new Error('Invalid date');
  }
  return m.format('YYYY-MM-DD');
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. moment.utc() — without isValid() check
// ─────────────────────────────────────────────────────────────────────────────

export function utcNoCatch(input: string): Date {
  const m = moment.utc(input);
  // SHOULD_NOT_FIRE: scanner gap — utc-invalid-date — moment.utc() returns invalid object for bad input. No isValid() check.
  return m.toDate();
}

export function utcWithIsValid(input: string): Date {
  const m = moment.utc(input);
  // SHOULD_NOT_FIRE: isValid() guard present
  if (!m.isValid()) {
    throw new Error('Invalid UTC date');
  }
  return m.toDate();
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. moment.parseZone() — without isValid() check
// ─────────────────────────────────────────────────────────────────────────────

export function parseZoneNoCatch(input: string): string {
  const m = moment.parseZone(input);
  // SHOULD_NOT_FIRE: scanner gap — parsezone-invalid-date — parseZone() returns invalid moment with NaN offset for bad input. No isValid() check.
  return m.format();
}

export function parseZoneWithIsValid(input: string): string {
  const m = moment.parseZone(input);
  // SHOULD_NOT_FIRE: isValid() guard present
  if (!m.isValid()) {
    throw new Error('Invalid date with timezone');
  }
  return m.format();
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. moment.unix() — without isValid() check
// ─────────────────────────────────────────────────────────────────────────────

export function unixNoCatch(ts: number): string {
  const m = moment.unix(ts);
  // SHOULD_NOT_FIRE: scanner gap — unix-nan-timestamp — moment.unix(NaN) returns invalid moment. No isValid() check.
  return m.format('YYYY-MM-DD');
}

export function unixWithIsValid(ts: number): string {
  if (!isFinite(ts)) {
    throw new Error('Invalid timestamp');
  }
  const m = moment.unix(ts);
  // SHOULD_NOT_FIRE: input validated before use
  return m.format('YYYY-MM-DD');
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. moment.locale() — path traversal
// ─────────────────────────────────────────────────────────────────────────────

export function localeFromUserInput(userLocale: string): void {
  // SHOULD_FIRE: locale-path-traversal — user-provided locale without allowlist check
  moment.locale(userLocale);
}

export function localeWithAllowlist(userLocale: string): void {
  const ALLOWED = ['en', 'fr', 'de', 'es'];
  // SHOULD_NOT_FIRE: allowlist check present
  if (!ALLOWED.includes(userLocale)) {
    throw new Error('Unsupported locale');
  }
  moment.locale(userLocale);
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. moment.defineLocale() — path traversal
// ─────────────────────────────────────────────────────────────────────────────

export function defineLocaleFromUserInput(name: string, spec: any): void {
  // SHOULD_FIRE: definelocale-path-traversal — user-provided locale name without allowlist check
  moment.defineLocale(name, spec);
}

export function defineLocaleWithAllowlist(name: string, spec: any): void {
  const ALLOWED = ['x-custom-en', 'x-custom-fr'];
  // SHOULD_NOT_FIRE: allowlist check present
  if (!ALLOWED.includes(name)) {
    throw new Error('Unsupported locale name');
  }
  moment.defineLocale(name, spec);
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. moment.updateLocale() — path traversal
// ─────────────────────────────────────────────────────────────────────────────

export function updateLocaleFromUserInput(name: string, spec: any): void {
  // SHOULD_FIRE: updatelocale-path-traversal — user-provided locale name without allowlist
  moment.updateLocale(name, spec);
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Moment.format() — "Invalid date" string return + ReDoS
// ─────────────────────────────────────────────────────────────────────────────

export function formatNoCatch(input: string): string {
  // SHOULD_FIRE: format-invalid-date-string — format() returns "Invalid date" string for invalid moments
  return moment(input).format('YYYY-MM-DD');
}

export function formatRFC2822LongInput(input: string): moment.Moment {
  // SHOULD_NOT_FIRE: scanner gap — format-redos-unvalidated-input — no length validation before RFC2822 parsing
  return moment(input, moment.RFC_2822);
}

export function formatWithIsValid(input: string): string {
  const m = moment(input, 'YYYY-MM-DD', true);
  // SHOULD_NOT_FIRE: isValid() guard before format()
  if (!m.isValid()) {
    throw new Error('Invalid date');
  }
  return m.format('YYYY-MM-DD');
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Moment.toISOString() — returns null for invalid
// ─────────────────────────────────────────────────────────────────────────────

export function toISOStringNoCatch(input: string): string {
  const m = moment(input);
  // SHOULD_NOT_FIRE: scanner gap — toisostring-null-for-invalid — toISOString() returns null for invalid moments
  return m.toISOString()!;
}

export function toISOStringWithIsValid(input: string): string | null {
  const m = moment(input);
  // SHOULD_NOT_FIRE: isValid() guard before toISOString()
  if (!m.isValid()) {
    return null;
  }
  return m.toISOString();
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. moment.duration() — NaN propagation
// ─────────────────────────────────────────────────────────────────────────────

export function durationFromInvalidDiff(start: string, end: string): number {
  const startM = moment(start);
  const endM = moment(end);
  // SHOULD_NOT_FIRE: scanner gap — duration-nan-propagation — no isValid() check before diff, NaN propagates to duration
  const d = moment.duration(endM.diff(startM));
  return d.asMilliseconds();
}

export function durationWithValidation(start: string, end: string): number {
  const startM = moment(start, 'YYYY-MM-DD', true);
  const endM = moment(end, 'YYYY-MM-DD', true);
  // SHOULD_NOT_FIRE: both moments validated before diff
  if (!startM.isValid() || !endM.isValid()) {
    throw new Error('Invalid date range');
  }
  const d = moment.duration(endM.diff(startM));
  return d.asMilliseconds();
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. Moment.fromNow() — returns "Invalid date" string for invalid moments
// ─────────────────────────────────────────────────────────────────────────────

export function fromNowNoValidation(input: string): string {
  const m = moment(input);
  // SHOULD_NOT_FIRE: scanner gap — fromnow-invalid-date-string — fromNow() returns "Invalid date" string for invalid moment
  return m.fromNow();
}

export function fromNowWithIsValid(input: string): string {
  const m = moment(input);
  // SHOULD_NOT_FIRE: isValid() guard present
  if (!m.isValid()) {
    return 'Unknown time';
  }
  return m.fromNow();
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. Moment.from() — returns "Invalid date" string when either moment is invalid
// ─────────────────────────────────────────────────────────────────────────────

export function fromNoValidation(ts1: string, ts2: string): string {
  const a = moment(ts1);
  const b = moment(ts2);
  // SHOULD_NOT_FIRE: scanner gap — from-invalid-date-string — from() returns "Invalid date" if either moment is invalid
  return a.from(b);
}

export function fromWithIsValid(ts1: string, ts2: string): string {
  const a = moment(ts1);
  const b = moment(ts2);
  // SHOULD_NOT_FIRE: both moments validated
  if (!a.isValid() || !b.isValid()) {
    throw new Error('Invalid date input');
  }
  return a.from(b);
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. Moment.add() — no-op on invalid moments + month-end clamping
// ─────────────────────────────────────────────────────────────────────────────

export function addNoValidation(input: string): string {
  const m = moment(input);
  // SHOULD_NOT_FIRE: scanner gap — add-noop-on-invalid — add() is a no-op on invalid moments, downstream format returns "Invalid date"
  return m.add(7, 'days').format('YYYY-MM-DD');
}

export function addWithIsValid(input: string): string {
  const m = moment(input, 'YYYY-MM-DD', true);
  // SHOULD_NOT_FIRE: isValid() check before add
  if (!m.isValid()) {
    throw new Error('Invalid date');
  }
  return m.add(7, 'days').format('YYYY-MM-DD');
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. Moment.subtract() — no-op on invalid moments
// ─────────────────────────────────────────────────────────────────────────────

export function subtractNoValidation(input: string): string {
  const m = moment(input);
  // SHOULD_NOT_FIRE: scanner gap — subtract-noop-on-invalid — subtract() is a no-op on invalid moments
  return m.subtract(1, 'month').format('YYYY-MM-DD');
}

export function subtractWithIsValid(input: string): string {
  const m = moment(input, 'YYYY-MM-DD', true);
  // SHOULD_NOT_FIRE: isValid() check before subtract
  if (!m.isValid()) {
    throw new Error('Invalid date');
  }
  return m.subtract(1, 'month').format('YYYY-MM-DD');
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. moment.min() — invalid moment in array propagates to result
// ─────────────────────────────────────────────────────────────────────────────

export function minNoValidation(dates: string[]): string {
  const moments = dates.map(d => moment(d));
  // SHOULD_NOT_FIRE: scanner gap — min-invalid-moment-propagation — invalid moment in array makes result invalid
  const earliest = moment.min(moments);
  return earliest.format('YYYY-MM-DD');
}

export function minWithFilterValidation(dates: string[]): string {
  const valid = dates.map(d => moment(d)).filter(m => m.isValid());
  // SHOULD_NOT_FIRE: invalid moments filtered out before min()
  if (valid.length === 0) {
    throw new Error('No valid dates');
  }
  const earliest = moment.min(valid);
  return earliest.format('YYYY-MM-DD');
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. moment.max() — invalid moment in array propagates to result
// ─────────────────────────────────────────────────────────────────────────────

export function maxNoValidation(dates: string[]): string {
  const moments = dates.map(d => moment(d));
  // SHOULD_NOT_FIRE: scanner gap — max-invalid-moment-propagation — invalid moment in array makes result invalid
  const latest = moment.max(moments);
  return latest.format('YYYY-MM-DD');
}

export function maxWithFilterValidation(dates: string[]): string {
  const valid = dates.map(d => moment(d)).filter(m => m.isValid());
  // SHOULD_NOT_FIRE: invalid moments filtered out before max()
  if (valid.length === 0) {
    throw new Error('No valid dates');
  }
  const latest = moment.max(valid);
  return latest.format('YYYY-MM-DD');
}
