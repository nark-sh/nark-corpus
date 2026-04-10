/**
 * rxjs Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "rxjs"):
 *   - firstValueFrom()  postconditions: observable-error, empty-completion
 *   - lastValueFrom()   postconditions: observable-error, empty-completion
 *
 * Detection path: named import → ThrowingFunctionDetector fires firstValueFrom()/lastValueFrom() →
 *   ContractMatcher checks try-catch → postcondition fires
 */

import { firstValueFrom, lastValueFrom, of, EMPTY } from "rxjs";

// ─────────────────────────────────────────────────────────────────────────────
// 1. firstValueFrom() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function firstValueFromNoCatch(source: any) {
  // SHOULD_FIRE: observable-error — firstValueFrom() throws if Observable errors. No try-catch.
  const value = await firstValueFrom(source);
  return value;
}

export async function firstValueFromEmptyNoCatch() {
  // SHOULD_FIRE: observable-error — firstValueFrom(EMPTY) throws EmptyError. No try-catch.
  const value = await firstValueFrom(EMPTY);
  return value;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. firstValueFrom() — properly wrapped in try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function firstValueFromWithCatch(source: any) {
  try {
    // SHOULD_NOT_FIRE: firstValueFrom() inside try-catch satisfies error handling requirement
    const value = await firstValueFrom(source);
    return value;
  } catch (err) {
    console.error("Observable error:", err);
    throw err;
  }
}

export async function firstValueFromWithDefault() {
  // SHOULD_FIRE: observable-error — defaultValue avoids EmptyError but not Observable errors. No try-catch.
  const value = await firstValueFrom(EMPTY, { defaultValue: null });
  return value;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. lastValueFrom() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function lastValueFromNoCatch(source: any) {
  // SHOULD_FIRE: observable-error — lastValueFrom() throws if Observable errors. No try-catch.
  const value = await lastValueFrom(source);
  return value;
}

export async function lastValueFromNestjsPattern(client: any) {
  // SHOULD_FIRE: observable-error — NestJS microservice call without try-catch. Client may error.
  const result = await lastValueFrom(client.send({ cmd: "sum" }, [1, 2, 3]));
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. lastValueFrom() — properly wrapped in try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function lastValueFromWithCatch(source: any) {
  try {
    // SHOULD_NOT_FIRE: lastValueFrom() inside try-catch satisfies error handling requirement
    const value = await lastValueFrom(source);
    return value;
  } catch (err) {
    console.error("Observable error:", err);
    throw err;
  }
}

export async function lastValueFromWithDefault(source: any) {
  // SHOULD_FIRE: observable-error — defaultValue avoids EmptyError but not Observable errors. No try-catch.
  const value = await lastValueFrom(source, { defaultValue: undefined });
  return value;
}

export async function lastValueFromKnownSafe() {
  try {
    // SHOULD_NOT_FIRE: of() never errors, and is inside try-catch anyway
    const value = await lastValueFrom(of(1, 2, 3));
    return value;
  } catch (err) {
    throw err;
  }
}
