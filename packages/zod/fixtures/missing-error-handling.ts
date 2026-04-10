/**
 * Demonstrates MISSING error handling for Zod validation.
 * These patterns SHOULD trigger ERROR violations.
 */

import { z } from 'zod';

// ❌ Violation 1: parse() without try-catch
function validateUserUnsafe(data: unknown) {
  const userSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    age: z.number().min(0),
  });

  // ❌ No error handling - will throw ZodError on invalid input
  const validData = userSchema.parse(data);
  return validData;
}

// ❌ Violation 2: parseAsync() without try-catch
async function validateUserAsyncUnsafe(data: unknown) {
  const userSchema = z.object({
    email: z.string().email(),
  }).refine(async (val) => {
    await new Promise(resolve => setTimeout(resolve, 10));
    return val.email !== 'taken@example.com';
  });

  // ❌ No error handling - will throw ZodError on invalid input or failed refinement
  const validData = await userSchema.parseAsync(data);
  return validData;
}

// ❌ Violation 3: Type coercion with parse() without try-catch
function parseTimestampUnsafe(data: unknown) {
  const timestampSchema = z.object({
    createdAt: z.coerce.date(),
  });

  // ❌ No error handling - will throw if coercion fails
  const validData = timestampSchema.parse(data);
  return validData;
}

// ❌ Violation 4: Custom refinements without error handling
function validatePasswordMatchUnsafe(data: unknown) {
  const passwordSchema = z.object({
    password: z.string().min(8),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

  // ❌ No error handling - will throw on validation failure
  passwordSchema.parse(data);
  return true;
}

// ❌ Violation 5: Nested validation without error handling
function validateNestedDataUnsafe(data: unknown) {
  const addressSchema = z.object({
    street: z.string(),
    city: z.string(),
    zipCode: z.string().regex(/^\d{5}$/),
  });

  const userSchema = z.object({
    name: z.string(),
    address: addressSchema,
  });

  // ❌ No error handling - will throw on validation failure
  const validData = userSchema.parse(data);
  return validData;
}

// ❌ Violation 6: Array validation without error handling
function validateArrayUnsafe(data: unknown) {
  const arraySchema = z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
  }));

  // ❌ No error handling - will throw on validation failure
  const validData = arraySchema.parse(data);
  return validData;
}

// ❌ Violation 7: Union types without error handling
function validateUnionUnsafe(data: unknown) {
  const responseSchema = z.union([
    z.object({ success: z.literal(true), data: z.any() }),
    z.object({ success: z.literal(false), error: z.string() }),
  ]);

  // ❌ No error handling - will throw on validation failure
  const validData = responseSchema.parse(data);
  return validData;
}

// ❌ Violation 8: Complex validation chain without error handling
function validateComplexChainUnsafe(data: unknown) {
  const schema = z.object({
    email: z.string().email(),
    age: z.number().min(18).max(120),
    tags: z.array(z.string()).min(1).max(10),
  }).refine((data) => data.age >= 21 || !data.tags.includes('alcohol'), {
    message: 'Must be 21+ for alcohol-related tags',
  });

  // ❌ No error handling - will throw on validation failure
  const validData = schema.parse(data);
  return validData;
}

// ❌ Violation 9: Optional fields with parse() without error handling
function validateOptionalFieldsUnsafe(data: unknown) {
  const schema = z.object({
    name: z.string(),
    nickname: z.string().optional(),
    bio: z.string().nullable(),
  });

  // ❌ No error handling - will throw on validation failure
  const validData = schema.parse(data);
  return validData;
}

// ❌ Violation 10: Discriminated union without error handling
function validateDiscriminatedUnionUnsafe(data: unknown) {
  const eventSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('click'), x: z.number(), y: z.number() }),
    z.object({ type: z.literal('keypress'), key: z.string() }),
  ]);

  // ❌ No error handling - will throw on validation failure
  const validData = eventSchema.parse(data);
  return validData;
}

// ❌ Violation 11: Transform without error handling
function transformDataUnsafe(data: unknown) {
  const schema = z.object({
    timestamp: z.string().transform((str) => new Date(str)),
  });

  // ❌ No error handling - will throw if transform fails
  const validData = schema.parse(data);
  return validData;
}

// ❌ Violation 12: Multiple refinements without error handling
function validateMultipleRefinementsUnsafe(data: unknown) {
  const schema = z.object({
    start: z.coerce.date(),
    end: z.coerce.date(),
  })
  .refine((data) => data.end > data.start, {
    message: 'End date must be after start date',
  })
  .refine((data) => {
    const diff = data.end.getTime() - data.start.getTime();
    return diff <= 365 * 24 * 60 * 60 * 1000; // Max 1 year
  }, {
    message: 'Date range cannot exceed 1 year',
  });

  // ❌ No error handling - will throw on validation failure
  const validData = schema.parse(data);
  return validData;
}

// Export functions for testing
export {
  validateUserUnsafe,
  validateUserAsyncUnsafe,
  parseTimestampUnsafe,
  validatePasswordMatchUnsafe,
  validateNestedDataUnsafe,
  validateArrayUnsafe,
  validateUnionUnsafe,
  validateComplexChainUnsafe,
  validateOptionalFieldsUnsafe,
  validateDiscriminatedUnionUnsafe,
  transformDataUnsafe,
  validateMultipleRefinementsUnsafe,
};
