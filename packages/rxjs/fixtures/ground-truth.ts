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
 * Contracted functions (from import "rxjs/fetch"):
 *   - fromFetch()  postconditions: fromfetch-no-ok-check, fromfetch-network-error-unhandled
 *
 * Detection path: named import → ThrowingFunctionDetector fires firstValueFrom()/lastValueFrom() →
 *   ContractMatcher checks try-catch → postcondition fires
 *
 * Note: fromFetch postconditions require "check response.ok" detection — no current scanner rule
 * (concern-20260416-rxjs-deepen-1 queued for fromfetch-no-ok-check detection)
 */

import { firstValueFrom, lastValueFrom, of, EMPTY } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { switchMap } from "rxjs/operators";

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

// ─────────────────────────────────────────────────────────────────────────────
// 5. fromFetch() — missing response.ok check (fromfetch-no-ok-check)
// ─────────────────────────────────────────────────────────────────────────────

// SHOULD_FIRE: fromfetch-network-error-unhandled — fromFetch with no try-catch for network errors
export async function fromFetchNoOkCheck(url: string): Promise<any> {
  const response = await firstValueFrom(fromFetch(url));
  return await response.json(); // silently processes 500 error body as data
}

// SHOULD_FIRE: fromfetch-network-error-unhandled — switchMap fromFetch with no try-catch
export async function fromFetchWithSwitchMapNoOkCheck(url: string): Promise<any> {
  return await firstValueFrom(
    fromFetch(url).pipe(
      switchMap(response => response.json())  // proceeds even if response.ok === false
    )
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. fromFetch() — properly handled
// ─────────────────────────────────────────────────────────────────────────────

export async function fromFetchWithOkCheckAndCatch(url: string): Promise<any> {
  // SHOULD_NOT_FIRE: checks response.ok and wraps in try-catch
  try {
    return await firstValueFrom(
      fromFetch(url).pipe(
        switchMap(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error(`HTTP Error: ${response.status}`);
        })
      )
    );
  } catch (err) {
    console.error("Fetch error:", err);
    throw err;
  }
}
