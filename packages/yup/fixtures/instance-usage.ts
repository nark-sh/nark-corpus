/**
 * Instance Usage Patterns for Yup
 *
 * This file demonstrates validation using schema instances and method references.
 * Tests that the analyzer can detect validation calls via schema instances.
 *
 * Expected: Violations should be reported for missing try-catch on instance methods.
 */

import * as Yup from 'yup';

// Create schema instances
const userSchema = Yup.object({
  email: Yup.string().email().required(),
  name: Yup.string().required(),
});

const productSchema = Yup.object({
  title: Yup.string().required(),
  price: Yup.number().positive().required(),
});

/**
 * ✅ PROPER: Instance method with try-catch
 */
class SchemaValidator {
  private schema = Yup.object({
    username: Yup.string().required(),
    age: Yup.number().positive(),
  });

  async validateWithTryCatch(data: unknown) {
    try {
      const result = await this.schema.validate(data);
      return result;
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        console.error('Validation failed:', error.errors);
      }
      throw error;
    }
  }

  validateSyncWithTryCatch(data: unknown) {
    try {
      const result = this.schema.validateSync(data);
      return result;
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        console.error('Sync validation failed:', error.errors);
      }
      throw error;
    }
  }
}

/**
 * ❌ MISSING: Instance method without try-catch
 * Should trigger violation: this.schema.validate() can reject
 */
class BadSchemaValidator {
  private schema = Yup.object({
    email: Yup.string().email().required(),
  });

  async validateNoTryCatch(data: unknown) {
    const result = await this.schema.validate(data);
    return result;
  }

  validateSyncNoTryCatch(data: unknown) {
    const result = this.schema.validateSync(data);
    return result;
  }
}

/**
 * ❌ MISSING: Stored reference to schema, validation without try-catch
 * Should trigger violation: storedSchema.validate() can reject
 */
async function validateWithStoredSchema(data: unknown) {
  const storedSchema = userSchema;
  const result = await storedSchema.validate(data);
  return result;
}

/**
 * ❌ MISSING: Method reference without try-catch
 * Should trigger violation: schema.validateAt() can reject
 */
async function validateFieldByReference(data: unknown) {
  const schema = userSchema;
  const email = await schema.validateAt('email', data);
  return email;
}

/**
 * ✅ PROPER: Factory pattern with try-catch
 */
function createValidator(schema: Yup.ObjectSchema<any>) {
  return {
    async validate(data: unknown) {
      try {
        const result = await schema.validate(data);
        return { success: true, data: result };
      } catch (error) {
        if (error instanceof Yup.ValidationError) {
          return { success: false, errors: error.errors };
        }
        throw error;
      }
    }
  };
}

/**
 * ❌ MISSING: Factory pattern without try-catch
 * Should trigger violation: schema.validate() can reject
 */
function createBadValidator(schema: Yup.ObjectSchema<any>) {
  return {
    async validate(data: unknown) {
      const result = await schema.validate(data);
      return result;
    }
  };
}

/**
 * ❌ MISSING: Schema passed as parameter, no try-catch
 * Should trigger violation: schema.validate() can reject
 */
async function validateWithProvidedSchema(schema: Yup.ObjectSchema<any>, data: unknown) {
  const result = await schema.validate(data);
  return result;
}

/**
 * ✅ PROPER: Schema passed as parameter with try-catch
 */
async function validateWithProvidedSchemaProper(schema: Yup.ObjectSchema<any>, data: unknown) {
  try {
    const result = await schema.validate(data);
    return result;
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      console.error('Validation failed');
    }
    throw error;
  }
}

/**
 * ❌ MISSING: Array of schemas, validation without try-catch
 * Should trigger violations: each schema.validate() can reject
 */
async function validateMultipleSchemas(data: unknown) {
  const schemas = [userSchema, productSchema];

  for (const schema of schemas) {
    const result = await schema.validate(data);
    console.log('Validated:', result);
  }
}

/**
 * ❌ MISSING: Destructured schema method
 * Should trigger violation
 */
async function validateWithDestructuring(data: unknown) {
  const { validate } = userSchema;
  const result = await validate.call(userSchema, data);
  return result;
}

/**
 * ✅ PROPER: Schema composition with try-catch
 */
async function validateComposedSchema(userData: unknown, productData: unknown) {
  try {
    const validUser = await userSchema.validate(userData);
    const validProduct = await productSchema.validate(productData);
    return { user: validUser, product: validProduct };
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      console.error('Validation failed:', error.errors);
    }
    throw error;
  }
}

/**
 * ❌ MISSING: Schema in object property
 * Should trigger violation: validator.schema.validate() can reject
 */
async function validateWithSchemaProperty(data: unknown) {
  const validator = {
    schema: userSchema,
    name: 'UserValidator',
  };

  const result = await validator.schema.validate(data);
  return result;
}

/**
 * ❌ MISSING: Conditional schema selection without try-catch
 * Should trigger violation: selected schema.validate() can reject
 */
async function validateConditionalSchema(data: unknown, type: 'user' | 'product') {
  const schema = type === 'user' ? userSchema : productSchema;
  const result = await schema.validate(data);
  return result;
}

/**
 * ✅ PROPER: Wrapper class with proper error handling
 */
class ProperValidatorWrapper {
  constructor(private schema: Yup.ObjectSchema<any>) {}

  async validate(data: unknown) {
    try {
      return await this.schema.validate(data);
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        console.error('Validation error:', error.errors);
      }
      throw error;
    }
  }

  validateSync(data: unknown) {
    try {
      return this.schema.validateSync(data);
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        console.error('Sync validation error:', error.errors);
      }
      throw error;
    }
  }
}

/**
 * ❌ MISSING: Wrapper class without error handling
 * Should trigger violations
 */
class BadValidatorWrapper {
  constructor(private schema: Yup.ObjectSchema<any>) {}

  async validate(data: unknown) {
    return await this.schema.validate(data);
  }

  validateSync(data: unknown) {
    return this.schema.validateSync(data);
  }
}

// Export for testing
export {
  SchemaValidator,
  BadSchemaValidator,
  validateWithStoredSchema,
  validateFieldByReference,
  createValidator,
  createBadValidator,
  validateWithProvidedSchema,
  validateWithProvidedSchemaProper,
  validateMultipleSchemas,
  validateWithDestructuring,
  validateComposedSchema,
  validateWithSchemaProperty,
  validateConditionalSchema,
  ProperValidatorWrapper,
  BadValidatorWrapper,
};
