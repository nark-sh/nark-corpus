/**
 * Demonstrates PROPER error handling for Zod validation.
 * These patterns should NOT trigger violations.
 */

import { z } from 'zod';

// ✅ Pattern 1: Using safeParse (recommended)
function validateUserWithSafeParse(data: unknown) {
  const userSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    age: z.number().min(0),
  });

  const result = userSchema.safeParse(data);

  if (!result.success) {
    console.error('Validation failed:', result.error.issues);
    return null;
  }

  return result.data;
}

// ✅ Pattern 2: Using parse with try-catch
function validateUserWithTryCatch(data: unknown) {
  const userSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    age: z.number().min(0),
  });

  try {
    const validData = userSchema.parse(data);
    return validData;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation failed:', error.issues);
    }
    return null;
  }
}

// ✅ Pattern 3: Using safeParseAsync for async validation
async function validateUserAsync(data: unknown) {
  const userSchema = z.object({
    email: z.string().email(),
  }).refine(async (val) => {
    // Simulate async validation (e.g., check if email exists in DB)
    await new Promise(resolve => setTimeout(resolve, 10));
    return val.email !== 'taken@example.com';
  }, {
    message: 'Email already taken',
  });

  const result = await userSchema.safeParseAsync(data);

  if (!result.success) {
    console.error('Async validation failed:', result.error.issues);
    return null;
  }

  return result.data;
}

// ✅ Pattern 4: Using parseAsync with try-catch
async function validateUserAsyncWithTryCatch(data: unknown) {
  const userSchema = z.object({
    email: z.string().email(),
  }).refine(async (val) => {
    await new Promise(resolve => setTimeout(resolve, 10));
    return val.email !== 'taken@example.com';
  });

  try {
    const validData = await userSchema.parseAsync(data);
    return validData;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Async validation failed:', error.issues);
    }
    return null;
  }
}

// ✅ Pattern 5: Type coercion with safeParse
function parseTimestampSafe(data: unknown) {
  const timestampSchema = z.object({
    createdAt: z.coerce.date(),
  });

  const result = timestampSchema.safeParse(data);

  if (!result.success) {
    console.error('Date coercion failed:', result.error.issues);
    return null;
  }

  return result.data;
}

// ✅ Pattern 6: Type coercion with try-catch
function parseTimestampWithTryCatch(data: unknown) {
  const timestampSchema = z.object({
    createdAt: z.coerce.date(),
  });

  try {
    const validData = timestampSchema.parse(data);
    return validData;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Date coercion failed:', error.issues);
    }
    return null;
  }
}

// ✅ Pattern 7: Custom refinements with safeParse
function validatePasswordMatch(data: unknown) {
  const passwordSchema = z.object({
    password: z.string().min(8),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

  const result = passwordSchema.safeParse(data);

  if (!result.success) {
    console.error('Password validation failed:', result.error.issues);
    return false;
  }

  return true;
}

// ✅ Pattern 8: Nested validation with safeParse
function validateNestedData(data: unknown) {
  const addressSchema = z.object({
    street: z.string(),
    city: z.string(),
    zipCode: z.string().regex(/^\d{5}$/),
  });

  const userSchema = z.object({
    name: z.string(),
    address: addressSchema,
  });

  const result = userSchema.safeParse(data);

  if (!result.success) {
    console.error('Nested validation failed:', result.error.issues);
    return null;
  }

  return result.data;
}

// ✅ Pattern 9: Array validation with safeParse
function validateArray(data: unknown) {
  const arraySchema = z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
  }));

  const result = arraySchema.safeParse(data);

  if (!result.success) {
    console.error('Array validation failed:', result.error.issues);
    return [];
  }

  return result.data;
}

// ✅ Pattern 10: Union types with safeParse
function validateUnion(data: unknown) {
  const responseSchema = z.union([
    z.object({ success: z.literal(true), data: z.any() }),
    z.object({ success: z.literal(false), error: z.string() }),
  ]);

  const result = responseSchema.safeParse(data);

  if (!result.success) {
    console.error('Union validation failed:', result.error.issues);
    return null;
  }

  return result.data;
}

// Export functions for testing
export {
  validateUserWithSafeParse,
  validateUserWithTryCatch,
  validateUserAsync,
  validateUserAsyncWithTryCatch,
  parseTimestampSafe,
  parseTimestampWithTryCatch,
  validatePasswordMatch,
  validateNestedData,
  validateArray,
  validateUnion,
};
