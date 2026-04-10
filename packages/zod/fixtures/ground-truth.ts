/**
 * zod Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "zod"):
 *   - schema.parse()       postcondition: parse-validation-error
 *   - schema.parseAsync()  postcondition: parse-async-validation-error
 *
 * Detection path: z.object()/z.string()/etc. → schema instance →
 *   ThrowingFunctionDetector fires parse()/parseAsync() →
 *   ContractMatcher checks try-catch → postcondition fires
 */

import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// 1. schema.parse() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export function parseNoCatch(data: unknown) {
  const schema = z.object({
    name: z.string(),
    email: z.string().email(),
  });
  // SHOULD_FIRE: parse-validation-error — schema.parse() throws ZodError on invalid input. No try-catch.
  const result = schema.parse(data);
  return result;
}

export function parseWithCatch(data: unknown) {
  const schema = z.object({
    name: z.string(),
    email: z.string().email(),
  });
  try {
    // SHOULD_NOT_FIRE: schema.parse() inside try-catch satisfies error handling
    const result = schema.parse(data);
    return result;
  } catch (err) {
    console.error('Validation failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. schema.parseAsync() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function parseAsyncNoCatch(data: unknown) {
  const schema = z.object({
    name: z.string(),
    email: z.string().email(),
  });
  // SHOULD_FIRE: parse-async-validation-error — schema.parseAsync() throws ZodError. No try-catch.
  const result = await schema.parseAsync(data);
  return result;
}

export async function parseAsyncWithCatch(data: unknown) {
  const schema = z.object({
    name: z.string(),
    email: z.string().email(),
  });
  try {
    // SHOULD_NOT_FIRE: schema.parseAsync() inside try-catch satisfies error handling
    const result = await schema.parseAsync(data);
    return result;
  } catch (err) {
    console.error('Async validation failed:', err);
    throw err;
  }
}
