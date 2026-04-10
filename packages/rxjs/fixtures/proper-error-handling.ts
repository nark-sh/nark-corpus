import { firstValueFrom, lastValueFrom, of, EMPTY } from "rxjs";

/**
 * Proper error handling for firstValueFrom.
 * Should NOT trigger violations.
 */
async function getFirstValueWithCatch(source: any) {
  try {
    const value = await firstValueFrom(source);
    return value;
  } catch (error) {
    console.error("Observable error:", error);
    throw error;
  }
}

/**
 * Using defaultValue to avoid EmptyError.
 * Should NOT trigger violations.
 */
async function getFirstWithDefault() {
  const value = await firstValueFrom(EMPTY, { defaultValue: null });
  return value;
}

/**
 * Proper error handling for lastValueFrom.
 * Should NOT trigger violations.
 */
async function getLastValueWithCatch(source: any) {
  try {
    const value = await lastValueFrom(source);
    return value;
  } catch (error) {
    console.error("Observable error:", error);
    throw error;
  }
}

/**
 * Using defaultValue with lastValueFrom to avoid EmptyError.
 * Should NOT trigger violations.
 */
async function getLastWithDefault(source: any) {
  const value = await lastValueFrom(source, { defaultValue: undefined });
  return value;
}

/**
 * Both calls inside try-catch.
 * Should NOT trigger violations.
 */
async function processObservables(source: any) {
  try {
    const first = await firstValueFrom(source);
    const last = await lastValueFrom(of(1, 2, 3));
    return { first, last };
  } catch (err) {
    throw err;
  }
}
