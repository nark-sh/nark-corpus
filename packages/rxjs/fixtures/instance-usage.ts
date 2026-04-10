import { Subject, BehaviorSubject, firstValueFrom, lastValueFrom } from "rxjs";

const subject = new Subject<number>();
const behavior = new BehaviorSubject<number>(0);

/**
 * Using firstValueFrom on a Subject without error handling.
 * Should trigger ERROR violation.
 */
async function processSubject() {
  // ❌ No try-catch — Subject can error
  const value = await firstValueFrom(subject);
  return value;
}

/**
 * Using lastValueFrom on a BehaviorSubject without error handling.
 * Should trigger ERROR violation.
 */
async function processBehavior() {
  // ❌ No try-catch — BehaviorSubject can error
  const value = await lastValueFrom(behavior);
  return value;
}

/**
 * Properly wrapped usage.
 * Should NOT trigger violations.
 */
async function processSubjectSafe() {
  try {
    const value = await firstValueFrom(subject);
    return value;
  } catch (err) {
    return null;
  }
}
