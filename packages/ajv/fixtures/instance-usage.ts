/**
 * AJV Instance Usage Examples
 *
 * Tests detection of ajv usage via instances and various instantiation patterns.
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';

/**
 * Test 1: Basic Ajv instance creation
 */
class UserValidator {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ allErrors: true });
  }

  // ❌ VIOLATION: validate() return value not checked
  validateUser(data: unknown): void {
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' }
      }
    };

    this.ajv.validate(schema, data);
  }

  // ✅ PROPER: validate() return value checked
  validateUserProper(data: unknown): boolean {
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' }
      }
    };

    const valid = this.ajv.validate(schema, data);

    if (!valid) {
      console.error('Validation errors:', this.ajv.errors);
      return false;
    }

    return true;
  }
}

/**
 * Test 2: Ajv instance with options
 */
class StrictValidator {
  private validator: Ajv;

  constructor() {
    this.validator = new Ajv({
      strict: true,
      allErrors: true,
      verbose: true
    });
  }

  // ❌ VIOLATION: compile() not in try-catch
  compileSchema(schema: object): void {
    const validate = this.validator.compile(schema);
    console.log('Schema compiled');
  }

  // ✅ PROPER: compile() in try-catch
  compileSchemaProper(schema: object): void {
    try {
      const validate = this.validator.compile(schema);
      console.log('Schema compiled successfully');
    } catch (error) {
      console.error('Compilation failed:', error);
      throw error;
    }
  }
}

/**
 * Test 3: Ajv instance with formats
 */
class FormattedValidator {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv();
    addFormats(this.ajv);
  }

  // ❌ VIOLATION: Return value ignored
  validateEmail(email: unknown): void {
    const schema = {
      type: 'string',
      format: 'email'
    };

    this.ajv.validate(schema, email);
  }
}

/**
 * Test 4: Multiple Ajv instances
 */
class MultiValidator {
  private strictAjv: Ajv;
  private looseAjv: Ajv;

  constructor() {
    this.strictAjv = new Ajv({ strict: true });
    this.looseAjv = new Ajv({ strict: false });
  }

  // ❌ VIOLATION: Both validate calls unchecked
  validateBoth(data: unknown, schema: object): void {
    this.strictAjv.validate(schema, data);
    this.looseAjv.validate(schema, data);
  }

  // ✅ PROPER: Both checked
  validateBothProper(data: unknown, schema: object): boolean {
    const strictValid = this.strictAjv.validate(schema, data);
    const looseValid = this.looseAjv.validate(schema, data);

    if (!strictValid || !looseValid) {
      console.error('Validation failed');
      return false;
    }

    return true;
  }
}

/**
 * Test 5: Factory pattern
 */
function createValidator(): Ajv {
  return new Ajv({ allErrors: true });
}

function useFactoryValidator(data: unknown): void {
  const ajv = createValidator();

  const schema = {
    type: 'object',
    properties: {
      id: { type: 'string' }
    }
  };

  // ❌ VIOLATION: Return value not checked
  ajv.validate(schema, data);
}

/**
 * Test 6: Ajv instance as parameter
 */
function validateWithProvidedInstance(ajv: Ajv, data: unknown, schema: object): void {
  // ❌ VIOLATION: Return value ignored
  ajv.validate(schema, data);
}

function validateWithProvidedInstanceProper(ajv: Ajv, data: unknown, schema: object): boolean {
  // ✅ PROPER: Return value checked
  const valid = ajv.validate(schema, data);

  if (!valid) {
    console.error('Validation failed:', ajv.errors);
    return false;
  }

  return true;
}

/**
 * Test 7: Compiled validator caching in instance
 */
class ValidatorCache {
  private ajv: Ajv;
  private validators: Map<string, any>;

  constructor() {
    this.ajv = new Ajv();
    this.validators = new Map();
  }

  getValidator(key: string, schema: object): any {
    if (!this.validators.has(key)) {
      // ❌ VIOLATION: No try-catch
      const validate = this.ajv.compile(schema);
      this.validators.set(key, validate);
    }
    return this.validators.get(key);
  }

  // ❌ VIOLATION: Return value not checked
  validate(key: string, data: unknown): void {
    const validate = this.validators.get(key);
    if (validate) {
      validate(data);
    }
  }

  // ✅ PROPER: Return value checked
  validateProper(key: string, data: unknown): boolean {
    const validate = this.validators.get(key);

    if (!validate) {
      return false;
    }

    if (validate(data)) {
      return true;
    } else {
      console.error('Validation failed:', validate.errors);
      return false;
    }
  }
}

/**
 * Test 8: Singleton pattern
 */
class ValidatorSingleton {
  private static instance: Ajv;

  static getInstance(): Ajv {
    if (!ValidatorSingleton.instance) {
      ValidatorSingleton.instance = new Ajv();
    }
    return ValidatorSingleton.instance;
  }

  static validate(data: unknown, schema: object): void {
    const ajv = ValidatorSingleton.getInstance();
    // ❌ VIOLATION: Return value not checked
    ajv.validate(schema, data);
  }

  static validateProper(data: unknown, schema: object): boolean {
    const ajv = ValidatorSingleton.getInstance();
    const valid = ajv.validate(schema, data);

    if (!valid) {
      console.error('Validation failed:', ajv.errors);
      return false;
    }

    return true;
  }
}

// Export classes to prevent tree-shaking
export {
  UserValidator,
  StrictValidator,
  FormattedValidator,
  MultiValidator,
  createValidator,
  useFactoryValidator,
  validateWithProvidedInstance,
  validateWithProvidedInstanceProper,
  ValidatorCache,
  ValidatorSingleton
};
