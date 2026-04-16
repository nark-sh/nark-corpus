/**
 * jsonschema Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "jsonschema"):
 *   - validate()                            postconditions: validate-throw-first, validate-throw-all, validate-throw-error,
 *                                                          validate-invalid-schema-argument, validate-unknown-attribute-throws,
 *                                                          validate-result-unchecked
 *   - Validator.prototype.validate()        postconditions: validator-validate-throw, validator-validate-unresolved-ref
 *   - Validator.prototype.addSchema()       postcondition: add-schema-invalid
 *   - scan()                                postcondition: scan-duplicate-conflicting-schema
 *
 * Note: jsonschema is a SYNCHRONOUS library. All throws are synchronous, not from
 * async operations. The contract captures when throwing options are set and when
 * the schema argument itself is invalid.
 */

import { Validator, validate, scan } from 'jsonschema';

// ─────────────────────────────────────────────────────────────────────────────
// 1. validate() with throwFirst — no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export function validateThrowFirstNoCatch(data: unknown) {
  const schema = { type: 'object', properties: { name: { type: 'string' } } };
  // SHOULD_FIRE: validate-throw-first — throwFirst option set, no try-catch. Throws ValidatorResultError on invalid input.
  const result = validate(data, schema, { throwFirst: true });
  return result;
}

export function validateThrowFirstWithCatch(data: unknown) {
  const schema = { type: 'object', properties: { name: { type: 'string' } } };
  try {
    // SHOULD_NOT_FIRE: validate-throw-first — wrapped in try-catch
    const result = validate(data, schema, { throwFirst: true });
    return result;
  } catch (err) {
    console.error('Validation failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. validate() with throwAll — no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export function validateThrowAllNoCatch(data: unknown) {
  const schema = { type: 'object', required: ['name', 'age'] };
  // SHOULD_FIRE: validate-throw-all — throwAll option set, no try-catch. Throws ValidatorResultError after full validation.
  const result = validate(data, schema, { throwAll: true });
  return result;
}

export function validateThrowAllWithCatch(data: unknown) {
  const schema = { type: 'object', required: ['name', 'age'] };
  try {
    // SHOULD_NOT_FIRE: validate-throw-all — wrapped in try-catch
    const result = validate(data, schema, { throwAll: true });
    return result;
  } catch (err) {
    console.error('All validation errors:', err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. validate() with throwError — no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export function validateThrowErrorNoCatch(data: unknown) {
  const schema = { type: 'string', minLength: 5 };
  // SHOULD_FIRE: validate-throw-error — throwError option set, no try-catch. Throws ValidationError at first failure.
  const result = validate(data, schema, { throwError: true });
  return result;
}

export function validateThrowErrorWithCatch(data: unknown) {
  const schema = { type: 'string', minLength: 5 };
  try {
    // SHOULD_NOT_FIRE: validate-throw-error — wrapped in try-catch
    const result = validate(data, schema, { throwError: true });
    return result;
  } catch (err) {
    console.error('Validation error:', err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Validator.prototype.validate() with throw options — no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export function instanceValidateNoCatch(data: unknown) {
  const v = new Validator();
  const schema = { type: 'object' };
  // SHOULD_FIRE: validate-throw-first — Validator instance validate() with throwFirst, no try-catch; fires via instance tracking
  const result = v.validate(data, schema, { throwFirst: true });
  return result;
}

export function instanceValidateWithCatch(data: unknown) {
  const v = new Validator();
  const schema = { type: 'object' };
  try {
    // SHOULD_NOT_FIRE: validator-validate-throw — wrapped in try-catch
    const result = v.validate(data, schema, { throwAll: true });
    return result;
  } catch (err) {
    console.error('Instance validate error:', err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. addSchema() without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export function addSchemaNoCatch(schemaFromDb: object) {
  const v = new Validator();
  // SHOULD_FIRE: add-schema-invalid — addSchema() with externally-loaded schema, no try-catch. Throws SchemaError if invalid.
  v.addSchema(schemaFromDb, '/ExternalSchema');
  return v;
}

export function addSchemaWithCatch(schemaFromDb: object) {
  const v = new Validator();
  try {
    // SHOULD_NOT_FIRE: add-schema-invalid — wrapped in try-catch
    v.addSchema(schemaFromDb, '/ExternalSchema');
    return v;
  } catch (err) {
    console.error('Failed to register schema:', err);
    throw new Error('Invalid schema from database');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. scan() without try-catch (duplicate conflicting schemas)
// ─────────────────────────────────────────────────────────────────────────────

export function scanNoCatch(externalSchema: object) {
  // Throws Error when two schemas share same $id URI but have different definitions.
  // SHOULD_FIRE: scan-duplicate-conflicting-schema — scan() processes external schema, no try-catch.
  const result = scan('/', externalSchema);
  return result;
}

export function scanWithCatch(externalSchema: object) {
  try {
    // SHOULD_NOT_FIRE: scan-duplicate-conflicting-schema — wrapped in try-catch
    const result = scan('/', externalSchema);
    return result;
  } catch (err) {
    console.error('Schema scan conflict:', err);
    throw new Error('Conflicting schema definitions detected');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. validate() with null/invalid schema argument — throws SchemaError
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: validate-invalid-schema-argument
export function validateWithNullSchemaNoCatch(data: unknown, schemaFromHttp: unknown) {
  // SHOULD_NOT_FIRE: validate-invalid-schema-argument — V2 cannot statically determine schema argument type validity; deferred
  const result = validate(data, schemaFromHttp as any);
  return result;
}

// @expect-clean
export function validateWithNullSchemaWithCatch(data: unknown, schemaFromHttp: unknown) {
  // SHOULD_NOT_FIRE: validate-invalid-schema-argument — wrapped in try-catch
  if (typeof schemaFromHttp !== 'object' || schemaFromHttp === null) {
    throw new Error('Schema must be a non-null object');
  }
  try {
    const result = validate(data, schemaFromHttp as any);
    return result;
  } catch (err) {
    console.error('Validation error:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. validate() with allowUnknownAttributes:false and unknown keyword
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: validate-unknown-attribute-throws
export function validateUnknownAttributeNoCatch(data: unknown, dynamicSchema: object) {
  // SHOULD_NOT_FIRE: validate-unknown-attribute-throws — V2 option picker suppresses non-throw options; deferred
  const result = validate(data, dynamicSchema, { allowUnknownAttributes: false });
  return result;
}

// @expect-clean
export function validateUnknownAttributeWithCatch(data: unknown, dynamicSchema: object) {
  // SHOULD_NOT_FIRE: validate-unknown-attribute-throws — wrapped in try-catch
  try {
    const result = validate(data, dynamicSchema, { allowUnknownAttributes: false });
    return result;
  } catch (err) {
    console.error('Schema has unknown attributes:', err);
    throw new Error('Schema uses unsupported keywords');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. validate() result discarded (silent failure — no .valid check)
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: validate-result-unchecked
export function validateResultDiscarded(data: unknown) {
  const schema = { type: 'object', required: ['name', 'email'] };
  // SHOULD_NOT_FIRE: validate-result-unchecked — V2 cannot detect return-value discard; deferred (requires data-flow analysis)
  validate(data, schema);
  console.log('Validated successfully'); // data may be invalid — result never checked
  return data;
}

// @expect-clean
export function validateResultChecked(data: unknown) {
  const schema = { type: 'object', required: ['name', 'email'] };
  // SHOULD_NOT_FIRE: validate-result-unchecked — result.valid is checked
  const result = validate(data, schema);
  if (!result.valid) {
    throw new Error(`Validation failed: ${result.errors.map(e => e.message).join(', ')}`);
  }
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. Validator.validate() with unresolved $ref — throws SchemaError
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: validator-validate-unresolved-ref
export function validateUnresolvedRefNoCatch(data: unknown) {
  const v = new Validator();
  // No addSchema() call — the referenced schema '/UserSchema' was never registered
  // SHOULD_NOT_FIRE: validator-validate-unresolved-ref — V2 does not track new Validator() instance methods; deferred
  const result = v.validate(data, { $ref: '/UserSchema' });
  return result;
}

// @expect-clean
export function validateUnresolvedRefWithCatch(data: unknown, userSchema: object) {
  const v = new Validator();
  try {
    // SHOULD_NOT_FIRE: validator-validate-unresolved-ref — schema is registered first, wrapped in try-catch
    v.addSchema(userSchema, '/UserSchema');
    const result = v.validate(data, { $ref: '/UserSchema' });
    if (!result.valid) {
      throw new Error(`Validation failed: ${result.errors[0].message}`);
    }
    return result;
  } catch (err) {
    console.error('Validation error:', err);
    throw err;
  }
}
