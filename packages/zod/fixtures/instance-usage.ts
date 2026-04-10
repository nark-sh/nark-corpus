/**
 * Demonstrates schema instance usage patterns.
 * Tests detection of parse() calls on schema instances.
 */

import { z } from 'zod';

// Create reusable schema instances
const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().min(0),
});

const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  zipCode: z.string().regex(/^\d{5}$/),
});

const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  price: z.number().positive(),
});

// ✅ Instance usage with safeParse
class UserValidator {
  private schema = userSchema;

  validate(data: unknown) {
    const result = this.schema.safeParse(data);
    if (!result.success) {
      console.error('Validation failed:', result.error.issues);
      return null;
    }
    return result.data;
  }
}

// ✅ Instance usage with try-catch
class AddressValidator {
  private schema = addressSchema;

  validate(data: unknown) {
    try {
      const validData = this.schema.parse(data);
      return validData;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation failed:', error.issues);
      }
      return null;
    }
  }
}

// ❌ Instance usage WITHOUT error handling
class ProductValidatorUnsafe {
  private schema = productSchema;

  validate(data: unknown) {
    // ❌ No error handling - will throw on invalid input
    const validData = this.schema.parse(data);
    return validData;
  }
}

// ✅ Factory pattern with safeParse
function createSchemaValidator<T>(schema: z.ZodSchema<T>) {
  return {
    validate(data: unknown) {
      const result = schema.safeParse(data);
      if (!result.success) {
        console.error('Validation failed:', result.error.issues);
        return null;
      }
      return result.data;
    },
  };
}

// ❌ Factory pattern WITHOUT error handling
function createUnsafeSchemaValidator<T>(schema: z.ZodSchema<T>) {
  return {
    validate(data: unknown) {
      // ❌ No error handling - will throw on invalid input
      const validData = schema.parse(data);
      return validData;
    },
  };
}

// ✅ Composed schemas with safeParse
const userWithAddressSchema = z.object({
  user: userSchema,
  address: addressSchema,
});

function validateUserWithAddress(data: unknown) {
  const result = userWithAddressSchema.safeParse(data);
  if (!result.success) {
    console.error('Validation failed:', result.error.issues);
    return null;
  }
  return result.data;
}

// ❌ Composed schemas WITHOUT error handling
function validateUserWithAddressUnsafe(data: unknown) {
  // ❌ No error handling - will throw on invalid input
  const validData = userWithAddressSchema.parse(data);
  return validData;
}

// ✅ Extended schemas with safeParse
const extendedUserSchema = userSchema.extend({
  phoneNumber: z.string().regex(/^\+?[\d\s\-()]+$/),
});

function validateExtendedUser(data: unknown) {
  const result = extendedUserSchema.safeParse(data);
  if (!result.success) {
    console.error('Validation failed:', result.error.issues);
    return null;
  }
  return result.data;
}

// ❌ Extended schemas WITHOUT error handling
function validateExtendedUserUnsafe(data: unknown) {
  // ❌ No error handling - will throw on invalid input
  const validData = extendedUserSchema.parse(data);
  return validData;
}

// ✅ Picked/Omitted schemas with safeParse
const userLoginSchema = userSchema.pick({ email: true });

function validateUserLogin(data: unknown) {
  const result = userLoginSchema.safeParse(data);
  if (!result.success) {
    console.error('Validation failed:', result.error.issues);
    return null;
  }
  return result.data;
}

// ❌ Picked/Omitted schemas WITHOUT error handling
function validateUserLoginUnsafe(data: unknown) {
  // ❌ No error handling - will throw on invalid input
  const validData = userLoginSchema.parse(data);
  return validData;
}

// ✅ Partial/Required schemas with safeParse
const partialUserSchema = userSchema.partial();

function validatePartialUser(data: unknown) {
  const result = partialUserSchema.safeParse(data);
  if (!result.success) {
    console.error('Validation failed:', result.error.issues);
    return null;
  }
  return result.data;
}

// ❌ Partial/Required schemas WITHOUT error handling
function validatePartialUserUnsafe(data: unknown) {
  // ❌ No error handling - will throw on invalid input
  const validData = partialUserSchema.parse(data);
  return validData;
}

// ✅ Async instance usage with safeParseAsync
class AsyncValidator {
  private schema = z.object({
    email: z.string().email(),
  }).refine(async (val) => {
    await new Promise(resolve => setTimeout(resolve, 10));
    return val.email !== 'taken@example.com';
  });

  async validate(data: unknown) {
    const result = await this.schema.safeParseAsync(data);
    if (!result.success) {
      console.error('Async validation failed:', result.error.issues);
      return null;
    }
    return result.data;
  }
}

// ❌ Async instance usage WITHOUT error handling
class AsyncValidatorUnsafe {
  private schema = z.object({
    email: z.string().email(),
  }).refine(async (val) => {
    await new Promise(resolve => setTimeout(resolve, 10));
    return val.email !== 'taken@example.com';
  });

  async validate(data: unknown) {
    // ❌ No error handling - will throw on invalid input
    const validData = await this.schema.parseAsync(data);
    return validData;
  }
}

// Export validators for testing
export {
  UserValidator,
  AddressValidator,
  ProductValidatorUnsafe,
  createSchemaValidator,
  createUnsafeSchemaValidator,
  validateUserWithAddress,
  validateUserWithAddressUnsafe,
  validateExtendedUser,
  validateExtendedUserUnsafe,
  validateUserLogin,
  validateUserLoginUnsafe,
  validatePartialUser,
  validatePartialUserUnsafe,
  AsyncValidator,
  AsyncValidatorUnsafe,
};
