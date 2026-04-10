/**
 * AJV Missing Error Handling Examples
 *
 * This file demonstrates INCORRECT error handling patterns for ajv.
 * Should trigger ERROR violations for missing error handling.
 */

import Ajv from 'ajv';

const ajv = new Ajv();

/**
 * VIOLATION: validate() return value not checked
 * Invalid data passes through unchecked
 */
function validateUserWithoutChecking(data: unknown): void {
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      age: { type: 'number' }
    },
    required: ['name']
  };

  // ❌ VIOLATION: Return value ignored - invalid data passes unchecked!
  ajv.validate(schema, data);

  // Data used without validation
  console.log('Processing data:', data);
}

/**
 * VIOLATION: compiled validator return value not checked
 */
function validateProductWithoutChecking(data: unknown): void {
  const schema = {
    type: 'object',
    properties: {
      id: { type: 'string' },
      price: { type: 'number' }
    }
  };

  const validate = ajv.compile(schema);

  // ❌ VIOLATION: Return value ignored!
  validate(data);

  // Proceeding without knowing if data is valid
  console.log('Processing product:', data);
}

/**
 * VIOLATION: compile() not wrapped in try-catch
 * Untrusted schema can crash the application
 */
function compileUntrustedSchemaWithoutErrorHandling(untrustedSchema: unknown): void {
  // ❌ VIOLATION: No try-catch for compilation errors!
  const validate = ajv.compile(untrustedSchema as object);

  console.log('Schema compiled');
}

/**
 * VIOLATION: validateSchema() return value not checked
 */
function validateSchemaWithoutChecking(schema: unknown): void {
  // ❌ VIOLATION: Return value ignored!
  ajv.validateSchema(schema as object);

  // Proceeding to use potentially invalid schema
  const validate = ajv.compile(schema as object);
}

/**
 * VIOLATION: Multiple validate() calls without checking
 */
function validateMultipleItemsWithoutChecking(items: unknown[]): void {
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string' }
    }
  };

  for (const item of items) {
    // ❌ VIOLATION: Return value not checked in loop!
    ajv.validate(schema, item);
  }

  console.log('All items processed');
}

/**
 * VIOLATION: Checking ajv.errors without checking return value first
 * This is insufficient - should check return value
 */
function validateWithOnlyErrorsCheck(data: unknown): void {
  const schema = {
    type: 'object',
    properties: {
      email: { type: 'string' }
    }
  };

  // ❌ VIOLATION: Calling without checking return value
  ajv.validate(schema, data);

  // Checking errors property is not enough - should check return value
  if (ajv.errors) {
    console.error('Errors found:', ajv.errors);
  }
}

/**
 * VIOLATION: Void return type implies validation result ignored
 */
function processUserData(userData: unknown): void {
  const userSchema = {
    type: 'object',
    properties: {
      username: { type: 'string', minLength: 3 },
      email: { type: 'string', format: 'email' }
    },
    required: ['username', 'email']
  };

  // ❌ VIOLATION: Return value not used
  ajv.validate(userSchema, userData);

  // Unsafe - proceeding with potentially invalid data
  console.log('User registered:', userData);
}

/**
 * VIOLATION: Assigned to variable but never checked
 */
function validateWithUnusedVariable(data: unknown): void {
  const schema = {
    type: 'object',
    properties: {
      count: { type: 'number', minimum: 0 }
    }
  };

  const validate = ajv.compile(schema);

  // ❌ VIOLATION: Result assigned but never checked
  const result = validate(data);

  // Variable 'result' is never used
  console.log('Validation complete');
}

/**
 * VIOLATION: Nested validation without checks
 */
function validateNestedDataWithoutChecking(data: unknown): void {
  const schema = {
    type: 'object',
    properties: {
      user: {
        type: 'object',
        properties: {
          name: { type: 'string' }
        }
      }
    }
  };

  // ❌ VIOLATION: Return value ignored in complex validation
  ajv.validate(schema, data);

  console.log('Complex data processed');
}

/**
 * VIOLATION: Array validation without checking each item
 */
function validateArrayWithoutChecking(items: unknown[]): void {
  const itemSchema = {
    type: 'object',
    properties: {
      id: { type: 'number' },
      name: { type: 'string' }
    },
    required: ['id', 'name']
  };

  const validate = ajv.compile(itemSchema);

  // ❌ VIOLATION: Calling validate on each item without checking results
  items.forEach(item => {
    validate(item);
  });

  console.log('All items validated');
}

// Export functions to prevent tree-shaking
export {
  validateUserWithoutChecking,
  validateProductWithoutChecking,
  compileUntrustedSchemaWithoutErrorHandling,
  validateSchemaWithoutChecking,
  validateMultipleItemsWithoutChecking,
  validateWithOnlyErrorsCheck,
  processUserData,
  validateWithUnusedVariable,
  validateNestedDataWithoutChecking,
  validateArrayWithoutChecking
};
