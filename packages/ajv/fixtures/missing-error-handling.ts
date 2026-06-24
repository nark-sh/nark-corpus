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

/**
 * VIOLATION: compileAsync() called without loadSchema option configured
 * @expect-violation: compileasync-no-load-schema
 * @expect-violation: compileasync-load-schema-rejects
 */
async function compileAsyncWithoutLoadSchema(schema: object): Promise<void> {
  // ❌ VIOLATION: Ajv instance has no loadSchema configured
  const ajvNoLoad = new Ajv();

  // compileAsync() throws synchronously: "options.loadSchema should be a function"
  const validate = await ajvNoLoad.compileAsync(schema);

  // No error handling — unhandled rejection crashes Node.js
  const result = validate({});
  console.log('Compiled and validated:', result);
}

/**
 * VIOLATION: compileAsync() not wrapped in try-catch — promise rejection unhandled
 * @expect-violation: compileasync-load-schema-rejects
 * @expect-violation: compileasync-invalid-schema
 */
async function compileAsyncWithoutErrorHandling(): Promise<void> {
  const ajvAsync = new Ajv({
    loadSchema: async (uri: string) => {
      const res = await fetch(uri);
      return res.json();
    }
  });

  const schemaWithExternalRef = {
    type: 'object',
    properties: {
      user: { $ref: 'https://example.com/schemas/user.json' }
    }
  };

  // ❌ VIOLATION: No try-catch — if loadSchema fails or returns invalid schema,
  // this promise rejects and crashes the server (unhandled promise rejection)
  const validate = await ajvAsync.compileAsync(schemaWithExternalRef);
  const result = validate({});
  console.log('Validated:', result);
}

/**
 * VIOLATION: addSchema() without checking for duplicate $id
 * @expect-violation: addschema-duplicate-id
 */
function addSchemaDuplicateId(): void {
  const ajvSchemas = new Ajv();

  const userSchema = {
    $id: 'https://example.com/schemas/user.json',
    type: 'object',
    properties: { name: { type: 'string' } },
    required: ['name']
  };

  // ❌ VIOLATION: Calling addSchema twice with the same $id throws:
  // "schema with key or id already exists"
  // This is a common bug in server code called on every request
  ajvSchemas.addSchema(userSchema);
  ajvSchemas.addSchema(userSchema); // crashes!
}

/**
 * VIOLATION: addKeyword() without checking for duplicates
 * @expect-violation: addkeyword-duplicate-keyword
 */
function addKeywordDuplicate(): void {
  const ajvKwd = new Ajv();

  // ❌ VIOLATION: Adding same custom keyword twice throws:
  // "Keyword nullable is already defined"
  const nullableKeyword = {
    keyword: 'nullable',
    type: 'object',
    schemaType: 'boolean',
    validate: (schema: boolean, data: unknown) => !schema || data !== null,
    errors: false
  };

  ajvKwd.addKeyword(nullableKeyword);
  ajvKwd.addKeyword(nullableKeyword); // crashes on second call!
}

/**
 * VIOLATION: removeSchema() called with a value whose type is not narrowed
 */
function removeSchemaWithUntypedKey(rawKey: unknown): void {
  const ajvRemove = new Ajv();
  // SHOULD_FIRE: removeschema-invalid-parameter
  ajvRemove.removeSchema(rawKey as any);
}

/**
 * VIOLATION: addMetaSchema() called twice with the same $id without checking
 */
function addMetaSchemaDuplicate(): void {
  const ajvMeta = new Ajv();
  const draft = {
    $id: 'https://example.com/meta/custom-dialect.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object'
  };
  // SHOULD_FIRE: addmetaschema-duplicate-key
  ajvMeta.addMetaSchema(draft);
  ajvMeta.addMetaSchema(draft); // crashes on second call
}

/**
 * VIOLATION: addMetaSchema() registering an untrusted meta-schema without try-catch
 */
function addMetaSchemaUntrusted(externalMetaSchema: object): void {
  const ajvMeta = new Ajv();
  // SHOULD_FIRE: addmetaschema-invalid-schema
  ajvMeta.addMetaSchema(externalMetaSchema);
}

/**
 * VIOLATION: validateSchema() called on a schema that may have non-string $schema
 */
function validateSchemaWithUnsafeDollarSchema(schema: object): void {
  const ajvVS = new Ajv();
  // SHOULD_FIRE: validateschema-invalid-dollar-schema
  const ok = ajvVS.validateSchema(schema);
  if (!ok) {
    console.error(ajvVS.errors);
  }
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
  validateArrayWithoutChecking,
  compileAsyncWithoutLoadSchema,
  compileAsyncWithoutErrorHandling,
  addSchemaDuplicateId,
  addKeywordDuplicate,
  removeSchemaWithUntypedKey,
  addMetaSchemaDuplicate,
  addMetaSchemaUntrusted,
  validateSchemaWithUnsafeDollarSchema
};
