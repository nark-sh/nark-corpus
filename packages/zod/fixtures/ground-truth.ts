/**
 * zod Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "zod"):
 *   - schema.parse()             postconditions: parse-validation-error, parse-type-coercion-error,
 *                                                parse-async-schema-error
 *   - schema.parseAsync()        postconditions: parse-async-validation-error, parse-async-refinement-error
 *   - schema.safeParse()         postcondition: safe-parse-success-check
 *   - schema.safeParseAsync()    postconditions: safe-parse-async-success-check, safe-parse-async-refinement-throw
 *   - schema.encodeAsync()       postconditions: encode-async-unidirectional-transform, encode-async-validation-error
 *   - schema.decodeAsync()       postconditions: decode-async-validation-error, decode-async-refinement-error
 *   - schema.safeEncodeAsync()   postconditions: safe-encode-async-unidirectional-transform, safe-encode-async-refinement-throw
 *   - schema.safeDecodeAsync()   postcondition: safe-decode-async-refinement-throw
 *
 * Detection path: z.object()/z.string()/etc. → schema instance →
 *   ThrowingFunctionDetector fires parse()/parseAsync()/encodeAsync()/decodeAsync() →
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

// ─────────────────────────────────────────────────────────────────────────────
// 3. parse() called on schema with async refinements — throws $ZodAsyncError
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: parse-async-schema-error
export function parseWithAsyncRefinement(value: string) {
  const schema = z.string().refine(async (s) => s.length > 3, { message: 'Too short' });
  // NO_DETECTOR_YET: parse-async-schema-error — sync parse() with async refine throws $ZodAsyncError (not ZodError).
  // Callers using instanceof z.ZodError catch will miss this error. Scanner concern queued.
  const result = schema.parse(value);
  return result;
}

// @expect-clean
export async function parseWithAsyncRefinementCorrect(value: string) {
  const schema = z.string().refine(async (s) => s.length > 3, { message: 'Too short' });
  try {
    // SHOULD_NOT_FIRE: uses parseAsync() for schema with async refinement
    const result = await schema.parseAsync(value);
    return result;
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(err.issues[0].message);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. encodeAsync() — without try-catch (v4 only)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: encode-async-unidirectional-transform
// @expect-violation: encode-async-validation-error
export async function encodeAsyncNoCatch(value: number) {
  const schema = z.number();
  // NO_DETECTOR_YET: encode-async-validation-error — encodeAsync() throws ZodError on validation failure. Scanner concern queued.
  // SHOULD_FIRE: encode-async-unidirectional-transform — if schema has transform(), throws ZodEncodeError.
  const encoded = await schema.encodeAsync(value);
  return encoded;
}

// @expect-clean
export async function encodeAsyncWithCatch(value: number) {
  const schema = z.number();
  try {
    // SHOULD_NOT_FIRE: encodeAsync() inside try-catch satisfies error handling
    const encoded = await schema.encodeAsync(value);
    return encoded;
  } catch (err) {
    // Must handle both ZodError and ZodEncodeError
    if (err instanceof z.ZodError) {
      throw new Error('Encode validation failed: ' + err.issues[0].message);
    }
    throw err; // ZodEncodeError or other error
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. decodeAsync() — without try-catch (v4 only)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: decode-async-validation-error
// @expect-violation: decode-async-refinement-error
export async function decodeAsyncNoCatch(value: unknown) {
  const schema = z.string().min(5);
  // SHOULD_FIRE: decode-async-validation-error — decodeAsync() throws ZodError on validation failure.
  const decoded = await schema.decodeAsync(value);
  return decoded;
}

// @expect-violation: decode-async-refinement-error
export async function decodeAsyncWithAsyncRefineNoCatch(value: unknown) {
  // Async refinement that calls an external service (e.g., DB uniqueness check)
  const schema = z.string().refine(
    async (s) => {
      // Simulated async DB check
      return s !== 'banned-user';
    },
    { message: 'Username is not available' }
  );
  // NO_DETECTOR_YET: decode-async-refinement-error — if async refine rejects, ZodError is thrown.
  // The original rejection from the external service is wrapped in a ZodError. Scanner concern queued.
  const decoded = await schema.decodeAsync(value);
  return decoded;
}

// @expect-clean
export async function decodeAsyncWithCatch(value: unknown) {
  const schema = z.string().min(5).refine(
    async (s) => s !== 'banned-user',
    { message: 'Username is not available' }
  );
  try {
    // SHOULD_NOT_FIRE: decodeAsync() inside try-catch satisfies error handling
    const decoded = await schema.decodeAsync(value);
    return decoded;
  } catch (err) {
    if (err instanceof z.ZodError) {
      const refinementIssues = err.issues.filter(i => i.code === 'custom');
      throw new Error('Validation failed: ' + (refinementIssues[0]?.message ?? err.message));
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. safeParseAsync() — async refinement throw (NOT a {success:false} case)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: safe-parse-async-refinement-throw
export async function safeParseAsyncRefinementThrowNoCatch(value: unknown) {
  const schema = z.string().refine(async (s) => {
    // External call inside refinement — may throw on DB/network failure
    throw new Error('DB connection lost');
  });
  // SHOULD_FIRE: safe-parse-async-refinement-throw — async refinement throw propagates as promise rejection, NOT a {success:false} result.
  const result = await schema.safeParseAsync(value);
  if (!result.success) {
    return { error: result.error };
  }
  return { data: result.data };
}

// @expect-clean
export async function safeParseAsyncRefinementThrowWithCatch(value: unknown) {
  const schema = z.string().refine(async (s) => {
    throw new Error('DB connection lost');
  });
  try {
    // SHOULD_NOT_FIRE: try-catch covers the async-refinement promise rejection
    const result = await schema.safeParseAsync(value);
    return result;
  } catch (err) {
    return { rejected: true, message: (err as Error).message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. safeEncodeAsync() — unidirectional transform + refinement throw (v4 only)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: safe-encode-async-unidirectional-transform
// @expect-violation: safe-encode-async-refinement-throw
export async function safeEncodeAsyncUnidirectionalNoCatch(value: string) {
  const schema = z.string().transform((s: string) => s.toUpperCase());
  // SHOULD_FIRE: safe-encode-async-unidirectional-transform — .transform() has no inverse, rejects with $ZodEncodeError.
  const result = await schema.safeEncodeAsync(value);
  return result;
}

// @expect-clean
export async function safeEncodeAsyncUnidirectionalWithCatch(value: string) {
  const schema = z.string().transform((s: string) => s.toUpperCase());
  try {
    // SHOULD_NOT_FIRE: try-catch covers the $ZodEncodeError rejection
    const result = await schema.safeEncodeAsync(value);
    return result;
  } catch (err) {
    return { encodeError: (err as Error).name };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. safeDecodeAsync() — async refinement throw (v4 only)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: safe-decode-async-refinement-throw
export async function safeDecodeAsyncRefinementThrowNoCatch(value: unknown) {
  const schema = z.string().refine(async (s) => {
    // DB call inside refinement — may throw
    throw new Error('User service unavailable');
  });
  // SHOULD_FIRE: safe-decode-async-refinement-throw — async refinement throw propagates as promise rejection.
  const result = await schema.safeDecodeAsync(value);
  if (!result.success) {
    return { error: result.error };
  }
  return { data: result.data };
}

// @expect-clean
export async function safeDecodeAsyncRefinementThrowWithCatch(value: unknown) {
  const schema = z.string().refine(async (s) => {
    throw new Error('User service unavailable');
  });
  try {
    // SHOULD_NOT_FIRE: try-catch covers the promise rejection from the async refinement
    const result = await schema.safeDecodeAsync(value);
    return result;
  } catch (err) {
    return { rejected: true, message: (err as Error).message };
  }
}
