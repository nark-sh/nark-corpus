/**
 * Instance-based usage patterns for Sinon.JS
 *
 * This file demonstrates instance-based patterns with sinon, including:
 * - createStubInstance usage
 * - Class-based test fixtures
 * - Static member stubbing
 * - Multiple test instances
 *
 * Mixed correct and incorrect patterns for detection testing.
 */

import sinon from 'sinon';

/**
 * Example class for testing
 */
class UserService {
  async findById(id: string): Promise<any> {
    return { id, name: 'John Doe' };
  }

  async save(user: any): Promise<void> {
    console.log('Saving user:', user);
  }

  async delete(id: string): Promise<void> {
    console.log('Deleting user:', id);
  }

  static async validateEmail(email: string): Promise<boolean> {
    return email.includes('@');
  }
}

/**
 * Pattern 1: CORRECT - createStubInstance with sandbox
 * ✅ Uses sandbox for automatic cleanup
 */
export class CorrectStubInstanceUsage {
  private sandbox: sinon.SinonSandbox;
  private stubInstance: sinon.SinonStubbedInstance<UserService>;

  beforeEach() {
    this.sandbox = sinon.createSandbox();
    this.stubInstance = this.sandbox.createStubInstance(UserService);
  }

  afterEach() {
    this.sandbox.restore(); // ✅ CORRECT - restores stub instance
  }

  async testFindById() {
    this.stubInstance.findById.resolves({ id: '123', name: 'Test User' });

    const user = await this.stubInstance.findById('123');
    console.log('Found user:', user);
  }
}

/**
 * Pattern 2: INCORRECT - createStubInstance without cleanup
 * ❌ VIOLATION: create-stub-instance-double-use
 */
export class IncorrectStubInstanceUsage {
  private stubInstance: sinon.SinonStubbedInstance<UserService>;

  beforeEach() {
    // ❌ BUG: Creating stub instance without sandbox or cleanup
    this.stubInstance = sinon.createStubInstance(UserService);
  }

  afterEach() {
    // ❌ BUG: Missing cleanup - should restore
  }

  async testSave() {
    this.stubInstance.save.resolves();
    await this.stubInstance.save({ id: '456', name: 'Test' });
  }
}

/**
 * Pattern 3: CORRECT - Stubbing static methods with sandbox
 * ✅ Uses sandbox for static member stubbing
 */
export class CorrectStaticMethodStubbing {
  private sandbox: sinon.SinonSandbox;

  beforeEach() {
    this.sandbox = sinon.createSandbox();
  }

  afterEach() {
    this.sandbox.restore(); // ✅ CORRECT - restores static stubs
  }

  async testStaticMethod() {
    this.sandbox.stub(UserService, 'validateEmail').resolves(true);

    const isValid = await UserService.validateEmail('test@example.com');
    console.log('Is valid:', isValid);
  }
}

/**
 * Pattern 4: INCORRECT - Stubbing static methods without cleanup
 * ❌ VIOLATION: stub-must-restore
 */
export function incorrectStaticMethodStubbing() {
  // ❌ BUG: Stubbing static method without cleanup
  const stub = sinon.stub(UserService, 'validateEmail');
  stub.resolves(false);

  // Use the stub
  UserService.validateEmail('invalid@test.com');

  // ❌ BUG: Missing stub.restore()
}

/**
 * Pattern 5: CORRECT - Multiple stub instances with sandbox
 * ✅ Properly manages multiple instances
 */
export class CorrectMultipleInstances {
  private sandbox: sinon.SinonSandbox;
  private userService: sinon.SinonStubbedInstance<UserService>;
  private adminService: sinon.SinonStubbedInstance<UserService>;

  beforeEach() {
    this.sandbox = sinon.createSandbox();
    this.userService = this.sandbox.createStubInstance(UserService);
    this.adminService = this.sandbox.createStubInstance(UserService);
  }

  afterEach() {
    this.sandbox.restore(); // ✅ CORRECT - restores all instances
  }

  async testMultipleInstances() {
    this.userService.findById.resolves({ id: '1', role: 'user' });
    this.adminService.findById.resolves({ id: '2', role: 'admin' });

    await this.userService.findById('1');
    await this.adminService.findById('2');
  }
}

/**
 * Pattern 6: INCORRECT - Multiple instances without cleanup
 * ❌ VIOLATION: create-stub-instance-double-use (multiple violations)
 */
export class IncorrectMultipleInstances {
  private userService: sinon.SinonStubbedInstance<UserService>;
  private adminService: sinon.SinonStubbedInstance<UserService>;

  beforeEach() {
    // ❌ BUG: Creating multiple instances without sandbox
    this.userService = sinon.createStubInstance(UserService);
    this.adminService = sinon.createStubInstance(UserService);
  }

  afterEach() {
    // ❌ BUG: Missing cleanup for both instances
  }

  async testMultipleInstances() {
    await this.userService.findById('1');
    await this.adminService.findById('2');
  }
}

/**
 * Pattern 7: CORRECT - Instance with partial stub override
 * ✅ Properly configures specific method stubs
 */
export class CorrectPartialStubOverride {
  private sandbox: sinon.SinonSandbox;

  beforeEach() {
    this.sandbox = sinon.createSandbox();
  }

  afterEach() {
    this.sandbox.restore(); // ✅ CORRECT
  }

  async testPartialOverride() {
    const instance = this.sandbox.createStubInstance(UserService, {
      findById: sinon.stub().resolves({ id: '789', name: 'Partial User' })
    });

    await instance.findById('789');
  }
}

/**
 * Pattern 8: INCORRECT - Stubbing instance method after createStubInstance
 * ❌ VIOLATION: stub-must-restore (attempting to wrap already wrapped)
 */
export function incorrectInstanceMethodStubbing() {
  const instance = sinon.createStubInstance(UserService);

  // ❌ BUG: Attempting to stub method on already-stubbed instance
  const stub = sinon.stub(instance, 'findById' as any); // May throw "already wrapped"
  stub.resolves({ id: 'error', name: 'Error User' });

  // ❌ BUG: Missing cleanup
}

/**
 * Pattern 9: CORRECT - Nested class instances with sandbox
 * ✅ Properly manages nested dependencies
 */
export class CorrectNestedInstances {
  private sandbox: sinon.SinonSandbox;

  beforeEach() {
    this.sandbox = sinon.createSandbox();
  }

  afterEach() {
    this.sandbox.restore(); // ✅ CORRECT
  }

  async testNestedDependencies() {
    const userService = this.sandbox.createStubInstance(UserService);
    userService.findById.resolves({ id: '1', name: 'User 1' });

    // Create another dependent service stub
    const dependentService = this.sandbox.createStubInstance(UserService);
    dependentService.save.resolves();

    await userService.findById('1');
    await dependentService.save({ id: '1', name: 'User 1' });
  }
}

/**
 * Pattern 10: INCORRECT - Accessing spy on stub instance without check
 * ❌ VIOLATION: spy-first-call-null-access
 */
export function incorrectSpyAccessOnStubInstance() {
  const instance = sinon.createStubInstance(UserService);

  // Stub is never called

  // ❌ BUG: Accessing firstCall without checking if stub was called
  const firstCallArgs = instance.findById.firstCall.args; // May be null!
  console.log('First call args:', firstCallArgs);

  // ❌ BUG: Also missing cleanup
}

/**
 * Pattern 11: CORRECT - Verifying stub instance calls with existence check
 * ✅ Checks stub.called before accessing call properties
 */
export class CorrectStubInstanceVerification {
  private sandbox: sinon.SinonSandbox;
  private instance: sinon.SinonStubbedInstance<UserService>;

  beforeEach() {
    this.sandbox = sinon.createSandbox();
    this.instance = this.sandbox.createStubInstance(UserService);
  }

  afterEach() {
    this.sandbox.restore(); // ✅ CORRECT
  }

  async testVerification() {
    this.instance.findById.resolves({ id: '123', name: 'Test' });

    await this.instance.findById('123');

    // ✅ CORRECT: Check called before accessing firstCall
    if (this.instance.findById.called) {
      const firstArg = this.instance.findById.firstCall.args[0];
      console.log('Called with ID:', firstArg);
    }

    // ✅ BETTER: Use sinon assertions
    sinon.assert.calledWith(this.instance.findById, '123');
  }
}

/**
 * Pattern 12: INCORRECT - Multiple createStubInstance calls without cleanup
 * ❌ VIOLATION: create-stub-instance-double-use
 */
export function multipleCreateStubInstanceCalls() {
  // First instance
  const instance1 = sinon.createStubInstance(UserService);
  instance1.findById.resolves({ id: '1', name: 'User 1' });

  // ❌ BUG: Creating second instance without cleaning up first
  const instance2 = sinon.createStubInstance(UserService);
  instance2.findById.resolves({ id: '2', name: 'User 2' });

  // ❌ BUG: No cleanup for either instance
}

/**
 * Pattern 13: CORRECT - Using spy on instance methods with proper cleanup
 * ✅ Properly spies on instance methods with sandbox
 */
export class CorrectInstanceSpying {
  private sandbox: sinon.SinonSandbox;

  beforeEach() {
    this.sandbox = sinon.createSandbox();
  }

  afterEach() {
    this.sandbox.restore(); // ✅ CORRECT
  }

  async testInstanceSpying() {
    const instance = new UserService();
    const spy = this.sandbox.spy(instance, 'findById');

    await instance.findById('123');

    sinon.assert.calledOnce(spy);
  }
}

/**
 * Pattern 14: INCORRECT - Spying on instance methods without cleanup
 * ❌ VIOLATION: spy-must-restore
 */
export async function incorrectInstanceSpying() {
  const instance = new UserService();

  // ❌ BUG: Spying without cleanup mechanism
  const spy = sinon.spy(instance, 'findById');

  await instance.findById('123');

  sinon.assert.calledOnce(spy);

  // ❌ BUG: Missing spy.restore()
}

/**
 * Pattern 15: CORRECT - Class instance with private methods stub
 * ✅ Uses sandbox for stubbing private methods via instance
 */
export class CorrectPrivateMethodStubbing {
  private sandbox: sinon.SinonSandbox;

  beforeEach() {
    this.sandbox = sinon.createSandbox();
  }

  afterEach() {
    this.sandbox.restore(); // ✅ CORRECT
  }

  testPrivateMethodStub() {
    class MyClass {
      publicMethod() {
        return this.privateMethod();
      }
      private privateMethod() {
        return 'private result';
      }
    }

    const instance = new MyClass();

    // Stub private method through sandbox
    this.sandbox.stub(instance as any, 'privateMethod').returns('stubbed private');

    const result = instance.publicMethod();
    console.log('Result:', result);
  }
}
