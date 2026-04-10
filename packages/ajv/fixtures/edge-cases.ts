/**
 * AJV Edge Cases and Special Patterns
 *
 * Tests edge cases including:
 * - Schema compilation errors
 * - Missing $ref schemas
 * - Strict mode warnings
 * - Async validation
 * - Custom keywords
 */

import Ajv from 'ajv';

const ajv = new Ajv({ strict: true, allErrors: true });

/**
 * Edge Case 1: Schema with $ref - missing schema causes error
 */
function validateWithMissingRef(data: unknown): void {
  const schema = {
    type: 'object',
    properties: {
      user: { $ref: '#/definitions/User' } // ❌ Definition missing!
    }
  };

  // ❌ VIOLATION: compile() will throw MissingRefError, no try-catch!
  const validate = ajv.compile(schema);

  // ❌ VIOLATION: Return value not checked
  validate(data);
}

/**
 * Edge Case 2: Schema with valid $ref - proper usage
 */
function validateWithValidRef(data: unknown): boolean {
  const schema = {
    type: 'object',
    properties: {
      user: { $ref: '#/definitions/User' }
    },
    definitions: {
      User: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' }
        }
      }
    }
  };

  // ✅ PROPER: compile() in try-catch
  let validate;
  try {
    validate = ajv.compile(schema);
  } catch (error) {
    console.error('Schema compilation failed:', error);
    return false;
  }

  // ✅ PROPER: Return value checked
  if (validate(data)) {
    return true;
  } else {
    console.error('Validation failed:', validate.errors);
    return false;
  }
}

/**
 * Edge Case 3: Invalid schema causes compilation error
 */
function validateWithInvalidSchema(data: unknown): void {
  const invalidSchema = {
    type: 'object',
    properties: {
      age: {
        type: 'number',
        minimum: 0,
        maximum: -1 // ❌ Invalid: maximum < minimum
      }
    }
  };

  // ❌ VIOLATION: No try-catch for invalid schema
  const validate = ajv.compile(invalidSchema as any);

  validate(data);
}

/**
 * Edge Case 4: Strict mode - unknown keywords
 */
function validateWithUnknownKeyword(data: unknown): void {
  const ajvStrict = new Ajv({ strict: true });

  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string' }
    },
    customKeyword: 'value' // ❌ Unknown keyword in strict mode
  };

  // ❌ VIOLATION: Will throw in strict mode, no try-catch
  const validate = ajvStrict.compile(schema as any);

  validate(data);
}

/**
 * Edge Case 5: validateSchema before compile (best practice)
 */
function validateSchemaComprehensively(schema: object, data: unknown): boolean {
  // ✅ PROPER: Validate schema structure first
  const schemaValid = ajv.validateSchema(schema);

  if (!schemaValid) {
    console.error('Schema validation failed:', ajv.errors);
    return false;
  }

  // ✅ PROPER: compile() in try-catch for additional errors
  let validate;
  try {
    validate = ajv.compile(schema);
  } catch (error) {
    console.error('Schema compilation failed:', error);
    return false;
  }

  // ✅ PROPER: Check validation result
  if (validate(data)) {
    return true;
  } else {
    console.error('Data validation failed:', validate.errors);
    return false;
  }
}

/**
 * Edge Case 6: Multiple schemas via addSchema
 */
function validateWithAddedSchemas(data: unknown): void {
  const ajvWithSchemas = new Ajv();

  // Add reusable schemas
  ajvWithSchemas.addSchema({
    $id: 'https://example.com/schemas/address.json',
    type: 'object',
    properties: {
      street: { type: 'string' },
      city: { type: 'string' }
    },
    required: ['street', 'city']
  });

  const userSchema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      address: { $ref: 'https://example.com/schemas/address.json' }
    }
  };

  // ❌ VIOLATION: compile() not in try-catch
  const validate = ajvWithSchemas.compile(userSchema);

  // ❌ VIOLATION: Return value not checked
  validate(data);
}

/**
 * Edge Case 7: Default values in schema
 */
function validateWithDefaults(data: unknown): void {
  const schemaWithDefaults = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      active: {
        type: 'boolean',
        default: 'true' // ❌ Invalid: default type doesn't match property type
      }
    }
  };

  // ❌ VIOLATION: compile() will fail due to invalid default, no try-catch
  const validate = ajv.compile(schemaWithDefaults as any);

  validate(data);
}

/**
 * Edge Case 8: Circular references in schema
 */
function validateWithCircularRef(data: unknown): boolean {
  const schema = {
    $id: 'https://example.com/tree',
    type: 'object',
    properties: {
      value: { type: 'number' },
      children: {
        type: 'array',
        items: { $ref: '#' } // Circular reference to root
      }
    }
  };

  // ✅ PROPER: Circular refs are valid, but still use try-catch
  let validate;
  try {
    validate = ajv.compile(schema);
  } catch (error) {
    console.error('Compilation failed:', error);
    return false;
  }

  // ✅ PROPER: Check result
  if (validate(data)) {
    return true;
  } else {
    console.error('Validation failed:', validate.errors);
    return false;
  }
}

/**
 * Edge Case 9: Format validation
 */
function validateWithFormats(data: unknown): void {
  const ajvWithFormats = new Ajv({ formats: { customFormat: /^[A-Z]+$/ } });

  const schema = {
    type: 'object',
    properties: {
      code: {
        type: 'string',
        format: 'customFormat'
      }
    }
  };

  const validate = ajvWithFormats.compile(schema);

  // ❌ VIOLATION: Return value not checked
  validate(data);
}

/**
 * Edge Case 10: Error message preservation across multiple validations
 */
function validateMultipleWithErrorPreservation(items: unknown[]): void {
  const schema = {
    type: 'object',
    properties: {
      id: { type: 'number' }
    },
    required: ['id']
  };

  const validate = ajv.compile(schema);
  const errors: Array<{ item: unknown; errors: unknown[] }> = [];

  for (const item of items) {
    // ✅ PROPER: Check return value
    if (!validate(item)) {
      // ✅ PROPER: Copy errors before they're overwritten
      const errorsCopy = validate.errors ? [...validate.errors] : [];
      errors.push({ item, errors: errorsCopy });
    }
  }

  if (errors.length > 0) {
    console.error('Validation failed for items:', errors);
  }
}

/**
 * Edge Case 11: Conditional schema validation
 */
function validateConditionalSchema(data: unknown): void {
  const schema = {
    type: 'object',
    properties: {
      type: { type: 'string', enum: ['personal', 'business'] },
      name: { type: 'string' }
    },
    required: ['type', 'name'],
    if: {
      properties: { type: { const: 'business' } }
    },
    then: {
      properties: {
        companyName: { type: 'string' }
      },
      required: ['companyName']
    }
  };

  // ❌ VIOLATION: compile() not in try-catch (conditional schemas can have errors)
  const validate = ajv.compile(schema);

  // ❌ VIOLATION: Return value not checked
  validate(data);
}

/**
 * Edge Case 12: Proper handling of getSchema
 */
function validateWithGetSchema(data: unknown, schemaKey: string): boolean {
  const ajvWithSchemas = new Ajv();

  // Add schema
  ajvWithSchemas.addSchema({
    $id: 'mySchema',
    type: 'object',
    properties: {
      name: { type: 'string' }
    }
  }, 'mySchema');

  // ✅ PROPER: getSchema returns undefined if not found
  const validate = ajvWithSchemas.getSchema(schemaKey);

  if (!validate) {
    console.error('Schema not found:', schemaKey);
    return false;
  }

  // ✅ PROPER: Check validation result
  if (validate(data)) {
    return true;
  } else {
    console.error('Validation failed:', validate.errors);
    return false;
  }
}

// Export functions to prevent tree-shaking
export {
  validateWithMissingRef,
  validateWithValidRef,
  validateWithInvalidSchema,
  validateWithUnknownKeyword,
  validateSchemaComprehensively,
  validateWithAddedSchemas,
  validateWithDefaults,
  validateWithCircularRef,
  validateWithFormats,
  validateMultipleWithErrorPreservation,
  validateConditionalSchema,
  validateWithGetSchema
};
