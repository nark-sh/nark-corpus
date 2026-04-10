/**
 * AJV Proper Error Handling Examples
 *
 * This file demonstrates CORRECT error handling patterns for ajv.
 * Should NOT trigger any violations.
 */

import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true });

/**
 * Example 1: Proper validate() usage - checking return value
 * Should NOT trigger violation
 */
function validateUserWithProperErrorHandling(data: unknown): boolean {
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      age: { type: 'number', minimum: 0 }
    },
    required: ['name', 'age']
  };

  const valid = ajv.validate(schema, data);

  if (!valid) {
    console.error('Validation failed:', ajv.errors);
    return false;
  }

  return true;
}

/**
 * Example 2: Compiled validator with return value check
 * Should NOT trigger violation
 */
function validateProductWithCompiledSchema(data: unknown): boolean {
  const schema = {
    type: 'object',
    properties: {
      id: { type: 'string' },
      price: { type: 'number', minimum: 0 }
    },
    required: ['id', 'price']
  };

  const validate = ajv.compile(schema);

  if (validate(data)) {
    // Data is valid
    return true;
  } else {
    // Handle validation errors
    console.error('Product validation failed:', validate.errors);
    return false;
  }
}

/**
 * Example 3: compile() wrapped in try-catch for untrusted schemas
 * Should NOT trigger violation
 */
function compileUntrustedSchemaWithErrorHandling(untrustedSchema: unknown): void {
  try {
    const validate = ajv.compile(untrustedSchema as object);
    console.log('Schema compiled successfully');
  } catch (error) {
    console.error('Schema compilation failed:', error);
    throw new Error('Invalid schema provided');
  }
}

/**
 * Example 4: validateSchema() with error checking
 * Should NOT trigger violation
 */
function validateSchemaBeforeUse(schema: unknown): void {
  const isValid = ajv.validateSchema(schema as object);

  if (!isValid) {
    console.error('Schema validation failed:', ajv.errors);
    throw new Error('Invalid schema structure');
  }

  // Now safe to compile
  try {
    const validate = ajv.compile(schema as object);
    console.log('Schema validated and compiled');
  } catch (error) {
    console.error('Compilation error:', error);
  }
}

/**
 * Example 5: Best practice - ESLint pattern (double validation)
 * Should NOT trigger violation
 */
function validateSchemaComprehensively(schema: unknown): void {
  // First: validate schema structure
  ajv.validateSchema(schema as object);

  if (ajv.errors) {
    const errorMessages = ajv.errors.map(err =>
      `${err.instancePath}: ${err.message}`
    ).join('\n');
    throw new Error(`Schema structure invalid:\n${errorMessages}`);
  }

  // Second: compile to catch additional errors (defaults, refs, etc.)
  try {
    ajv.compile(schema as object);
  } catch (err) {
    throw new Error(`Schema compilation failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * Example 6: Copying errors before they're overwritten
 * Should NOT trigger violation
 */
function validateMultipleItemsWithErrorPreservation(items: unknown[]): void {
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string' }
    },
    required: ['name']
  };

  const allErrors: unknown[] = [];

  for (const item of items) {
    const valid = ajv.validate(schema, item);

    if (!valid) {
      // Copy errors before next validation overwrites them
      const errorsCopy = ajv.errors ? [...ajv.errors] : [];
      allErrors.push({ item, errors: errorsCopy });
    }
  }

  if (allErrors.length > 0) {
    console.error('Validation failed for items:', allErrors);
  }
}

/**
 * Example 7: Conditional validation with proper checking
 * Should NOT trigger violation
 */
function conditionalValidation(data: unknown, shouldValidate: boolean): void {
  if (!shouldValidate) {
    return;
  }

  const schema = {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' }
    }
  };

  const valid = ajv.validate(schema, data);

  if (!valid) {
    console.error('Email validation failed:', ajv.errors);
    throw new Error('Invalid email format');
  }
}

// Export functions to prevent tree-shaking
export {
  validateUserWithProperErrorHandling,
  validateProductWithCompiledSchema,
  compileUntrustedSchemaWithErrorHandling,
  validateSchemaBeforeUse,
  validateSchemaComprehensively,
  validateMultipleItemsWithErrorPreservation,
  conditionalValidation
};
