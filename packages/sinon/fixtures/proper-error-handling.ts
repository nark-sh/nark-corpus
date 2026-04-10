/**
 * Proper error handling patterns for Sinon.JS
 *
 * This file demonstrates CORRECT usage of sinon stubs, spies, mocks, and fake timers
 * with proper cleanup in afterEach hooks.
 *
 * Should NOT trigger any violations.
 */

import sinon from 'sinon';

/**
 * Example 1: Proper sandbox usage with restore in afterEach
 * CORRECT: Uses sandbox with automatic cleanup
 */
export class ProperSandboxUsage {
  private sandbox: sinon.SinonSandbox;
  private apiClient = {
    fetchData: () => Promise.resolve({ data: 'original' }),
    processData: (data: any) => data
  };

  beforeEach() {
    this.sandbox = sinon.createSandbox();
  }

  afterEach() {
    this.sandbox.restore(); // ✅ REQUIRED - prevents test pollution
  }

  testWithSandbox() {
    const stub = this.sandbox.stub(this.apiClient, 'fetchData');
    stub.resolves({ data: 'stubbed' });

    // Test code here
    return this.apiClient.fetchData();
  }
}

/**
 * Example 2: Proper manual stub cleanup
 * CORRECT: Manually restore stub in afterEach
 */
export class ProperManualStubCleanup {
  private stub: sinon.SinonStub | null = null;
  private calculator = {
    add: (a: number, b: number) => a + b
  };

  beforeEach() {
    this.stub = sinon.stub(this.calculator, 'add');
  }

  afterEach() {
    if (this.stub) {
      this.stub.restore(); // ✅ REQUIRED - manual cleanup
      this.stub = null;
    }
  }

  testCalculator() {
    this.stub!.returns(100);
    return this.calculator.add(5, 10);
  }
}

/**
 * Example 3: Proper spy usage with existence checks
 * CORRECT: Checks spy.called before accessing spy.firstCall
 */
export function properSpyAccess() {
  const callback = sinon.spy();

  // Call the spy
  callback('arg1', 'arg2');

  // ✅ CORRECT: Check spy.called before accessing firstCall
  if (callback.called) {
    const firstArg = callback.firstCall.args[0];
    console.log('First argument:', firstArg);
  }

  // ✅ BETTER: Use spy.calledWith() instead
  if (callback.calledWith('arg1')) {
    console.log('Called with arg1');
  }

  // ✅ BEST: Use sinon assertions
  sinon.assert.calledWith(callback, 'arg1', 'arg2');

  callback.resetHistory(); // Clean up spy history
}

/**
 * Example 4: Proper mock usage with verification
 * CORRECT: Calls mock.verify() to enforce expectations
 */
export class ProperMockUsage {
  private sandbox: sinon.SinonSandbox;
  private service = {
    saveData: (data: any) => Promise.resolve(),
    deleteData: (id: string) => Promise.resolve()
  };

  beforeEach() {
    this.sandbox = sinon.createSandbox();
  }

  afterEach() {
    this.sandbox.verifyAndRestore(); // ✅ REQUIRED - verifies AND restores
  }

  testWithMock() {
    const mock = this.sandbox.mock(this.service);

    // Set expectations
    mock.expects('saveData').once().withArgs({ id: 1, name: 'test' });
    mock.expects('deleteData').never();

    // Execute code under test
    this.service.saveData({ id: 1, name: 'test' });

    // Verification happens in afterEach via verifyAndRestore()
  }
}

/**
 * Example 5: Proper fake timer usage with restore
 * CORRECT: Restores clock in afterEach
 */
export class ProperFakeTimerUsage {
  private clock: sinon.SinonFakeTimers | null = null;

  beforeEach() {
    this.clock = sinon.useFakeTimers();
  }

  afterEach() {
    if (this.clock) {
      this.clock.restore(); // ✅ REQUIRED - prevents timer pollution
      this.clock = null;
    }
  }

  testWithFakeTimers() {
    let called = false;

    setTimeout(() => {
      called = true;
    }, 1000);

    // Advance clock
    this.clock!.tick(1000);

    return called; // Should be true
  }

  async testAsyncWithFakeTimers() {
    let resolved = false;

    // Fire async function without awaiting
    (async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      resolved = true;
    })();

    // ✅ CORRECT: Use tickAsync for promise-based code
    await this.clock!.tickAsync(1000);

    return resolved; // Should be true
  }
}

/**
 * Example 6: Proper argument validation before stubbing
 * CORRECT: Checks property exists and is a function before stubbing
 */
export function properPropertyValidation() {
  const obj: any = {
    existingMethod: () => 'original'
  };

  // ✅ CORRECT: Verify property exists and is a function
  if (typeof obj.existingMethod === 'function') {
    const stub = sinon.stub(obj, 'existingMethod');
    stub.returns('stubbed');
    stub.restore();
  }

  // Avoid stubbing non-existent or non-function properties
  if (typeof obj.nonExistent !== 'function') {
    console.log('Cannot stub non-existent property');
  }
}

/**
 * Example 7: Proper stub configuration with bounds checking
 * CORRECT: Validates argument indices before using returnsArg
 */
export function properStubConfiguration() {
  const stub = sinon.stub();

  // Configure stub to return first argument
  stub.returnsArg(0);

  // ✅ CORRECT: Call with sufficient arguments
  const result = stub('arg1', 'arg2');
  console.log('Result:', result); // 'arg1'

  stub.reset();
}

/**
 * Example 8: Proper callback stub configuration
 * CORRECT: Ensures callback arguments are functions
 */
export function properCallbackStub() {
  const stub = sinon.stub();

  // Configure to call first argument as callback
  stub.callsArg(0);

  // ✅ CORRECT: Call with function as first argument
  stub(() => {
    console.log('Callback invoked');
  });

  stub.reset();
}

/**
 * Example 9: Proper yields usage
 * CORRECT: Ensures stub is called with a callback function
 */
export function properYieldsUsage() {
  const stub = sinon.stub();
  stub.yields('error', null);

  // ✅ CORRECT: Call stub with a function argument
  stub((err: any, data: any) => {
    if (err) {
      console.log('Callback received error:', err);
    }
  });

  stub.reset();
}

/**
 * Example 10: Proper createStubInstance usage
 * CORRECT: Uses sandbox for cleanup between stub instances
 */
export class ProperStubInstanceUsage {
  private sandbox: sinon.SinonSandbox;

  beforeEach() {
    this.sandbox = sinon.createSandbox();
  }

  afterEach() {
    this.sandbox.restore(); // ✅ Cleans up stub instances
  }

  testStubInstance() {
    class MyClass {
      method() {
        return 'original';
      }
    }

    // ✅ CORRECT: Use sandbox for automatic cleanup
    const instance = this.sandbox.createStubInstance(MyClass);
    instance.method.returns('stubbed');

    return instance.method();
  }
}

/**
 * Example 11: Proper try-finally cleanup for inline tests
 * CORRECT: Uses try-finally for cleanup in standalone tests
 */
export function properTryFinallyCleanup() {
  const obj = {
    method: () => 'original'
  };

  const stub = sinon.stub(obj, 'method');

  try {
    stub.returns('stubbed');
    const result = obj.method();
    console.log('Result:', result);
  } finally {
    stub.restore(); // ✅ REQUIRED - ensures cleanup even on error
  }
}

/**
 * Example 12: Proper clock cleanup in try-finally
 * CORRECT: Ensures fake timers are restored even on test failure
 */
export function properClockTryFinallyCleanup() {
  const clock = sinon.useFakeTimers();

  try {
    let called = false;
    setTimeout(() => { called = true; }, 1000);
    clock.tick(1000);
    console.log('Called:', called);
  } finally {
    clock.restore(); // ✅ REQUIRED - ensures timer cleanup
  }
}
