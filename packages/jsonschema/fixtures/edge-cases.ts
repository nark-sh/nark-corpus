/**
 * Edge cases for jsonschema - testing analyzer boundaries
 * Demonstrates what analyzer CAN and CANNOT detect
 */

import { Validator, validate } from 'jsonschema';

/**
 * Edge Case 1: Conditional throwing mode
 * Analyzer CAN detect the throwing branch
 */
function edgeCaseConditionalThrow(data: unknown, strict: boolean) {
  const schema = { type: 'object' };

  if (strict) {
    // ❌ Analyzer CAN detect - throwFirst without try-catch
    const result = validate(data, schema, { throwFirst: true });
    return result;
  } else {
    // No violation in non-strict mode (default behavior)
    const result = validate(data, schema);
    return result;
  }
}

/**
 * Edge Case 2: Proper conditional error handling
 * Should NOT trigger violations
 */
function properConditionalHandling(data: unknown, strict: boolean) {
  const schema = { type: 'object' };

  if (strict) {
    // ✅ try-catch for throwing mode
    try {
      return validate(data, schema, { throwFirst: true });
    } catch (error) {
      console.error('Strict validation failed:', error);
      return null;
    }
  } else {
    return validate(data, schema);
  }
}

/**
 * Edge Case 3: Mixed throwing operations
 * Should trigger multiple errors
 */
function edgeCaseMixedOps(data1: unknown, data2: unknown, schema: object) {
  const v = new Validator();

  // ❌ No try-catch for addSchema
  v.addSchema(schema, '/Test');

  // ❌ No try-catch for throwError
  const result1 = v.validate(data1, { $ref: '/Test' }, { throwError: true });

  // ❌ No try-catch for throwAll
  const result2 = v.validate(data2, { $ref: '/Test' }, { throwAll: true });

  return { result1, result2 };
}

/**
 * Edge Case 4: Nested function with throwing
 * Should trigger ERROR
 */
function edgeCaseNestedThrow(data: unknown) {
  function innerValidate() {
    const schema = { type: 'number' };
    // ❌ No try-catch in nested function
    return validate(data, schema, { throwFirst: true });
  }

  return innerValidate();
}

/**
 * Edge Case 5: Proper nested error handling
 * Should NOT trigger violations
 */
function properNestedHandling(data: unknown) {
  function innerValidate() {
    const schema = { type: 'number' };
    try {
      return validate(data, schema, { throwFirst: true });
    } catch (error) {
      console.error('Nested validation failed:', error);
      throw error;
    }
  }

  try {
    return innerValidate();
  } catch (error) {
    console.error('Validation error caught at outer level:', error);
    return null;
  }
}
