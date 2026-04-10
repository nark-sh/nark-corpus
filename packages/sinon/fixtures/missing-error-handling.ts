/**
 * Missing error handling patterns for Sinon.JS
 *
 * This file demonstrates INCORRECT usage of sinon with common mistakes:
 * - Missing restore() calls (most common bug)
 * - Accessing spy calls without existence checks
 * - Missing mock verification
 * - Missing clock cleanup
 * - Double-stubbing without restore
 *
 * Should trigger MULTIPLE ERROR violations.
 */

import sinon from 'sinon';

/**
 * BUG #1: Missing sandbox.restore() in afterEach
 * ❌ VIOLATION: sandbox-must-restore
 * IMPACT: Test pollution, "already wrapped" errors in subsequent tests
 */
export class MissingSandboxRestore {
  private sandbox: sinon.SinonSandbox;
  private apiClient = {
    fetchData: () => Promise.resolve({ data: 'original' })
  };

  beforeEach() {
    this.sandbox = sinon.createSandbox();
  }

  afterEach() {
    // ❌ BUG: Missing sandbox.restore()
    // Should be: this.sandbox.restore();
  }

  testWithSandbox() {
    const stub = this.sandbox.stub(this.apiClient, 'fetchData');
    stub.resolves({ data: 'stubbed' });
    return this.apiClient.fetchData();
  }
}

/**
 * BUG #2: Missing stub.restore() in afterEach
 * ❌ VIOLATION: stub-must-restore
 * IMPACT: TypeError: Attempted to wrap [method] which is already wrapped
 */
export class MissingStubRestore {
  private stub: sinon.SinonStub | null = null;
  private calculator = {
    add: (a: number, b: number) => a + b
  };

  beforeEach() {
    this.stub = sinon.stub(this.calculator, 'add');
  }

  afterEach() {
    // ❌ BUG: Missing stub.restore()
    // Should be: if (this.stub) { this.stub.restore(); }
  }

  testCalculator() {
    this.stub!.returns(100);
    return this.calculator.add(5, 10);
  }
}

/**
 * BUG #3: Accessing spy.firstCall without checking spy.called
 * ❌ VIOLATION: spy-first-call-null-access
 * IMPACT: TypeError: Cannot read property 'args' of null
 */
export function accessingSpyWithoutCheck() {
  const callback = sinon.spy();

  // Spy is never called, so firstCall is null

  // ❌ BUG: Accessing firstCall without checking spy.called
  const firstArg = callback.firstCall.args[0]; // TypeError!
  console.log('First argument:', firstArg);

  // ❌ BUG: Also missing cleanup
  // Should restore if this was a method spy
}

/**
 * BUG #4: Missing mock.verify()
 * ❌ VIOLATION: mock-verify-not-called
 * IMPACT: Expectations silently not enforced, tests pass when they should fail
 */
export class MissingMockVerify {
  private sandbox: sinon.SinonSandbox;
  private service = {
    saveData: (data: any) => Promise.resolve(),
    deleteData: (id: string) => Promise.resolve()
  };

  beforeEach() {
    this.sandbox = sinon.createSandbox();
  }

  afterEach() {
    this.sandbox.restore();
    // ❌ BUG: Missing mock verification
    // Should be: this.sandbox.verifyAndRestore() instead of just restore()
  }

  testWithMock() {
    const mock = this.sandbox.mock(this.service);

    // Set expectations
    mock.expects('saveData').once();
    mock.expects('deleteData').never();

    // Code under test may or may not call these methods
    // ❌ BUG: No verification, so expectations are never enforced
    // Should call: mock.verify() or sandbox.verifyAndRestore()
  }
}

/**
 * BUG #5: Missing clock.restore() in afterEach
 * ❌ VIOLATION: fake-timers-must-restore
 * IMPACT: Subsequent tests hang, setTimeout/setInterval never fire
 */
export class MissingClockRestore {
  private clock: sinon.SinonFakeTimers | null = null;

  beforeEach() {
    this.clock = sinon.useFakeTimers();
  }

  afterEach() {
    // ❌ BUG: Missing clock.restore()
    // Should be: if (this.clock) { this.clock.restore(); }
  }

  testWithFakeTimers() {
    let called = false;
    setTimeout(() => { called = true; }, 1000);
    this.clock!.tick(1000);
    return called;
  }
}

/**
 * BUG #6: Stubbing non-existent property
 * ❌ VIOLATION: stub-non-existent-property
 * IMPACT: TypeError: Attempted to wrap undefined property [name]
 */
export function stubbingNonExistentProperty() {
  const obj: any = {
    existingMethod: () => 'original'
  };

  // ❌ BUG: Attempting to stub non-existent property
  const stub = sinon.stub(obj, 'nonExistentMethod'); // TypeError!
  stub.returns('stubbed');

  // ❌ BUG: Also missing restore (if stub creation succeeded)
}

/**
 * BUG #7: Stubbing non-function property
 * ❌ VIOLATION: stub-non-existent-property
 * IMPACT: TypeError: property is not a function
 */
export function stubbingNonFunctionProperty() {
  const obj = {
    stringProperty: 'value',
    method: () => 'original'
  };

  // ❌ BUG: Attempting to stub non-function property
  const stub = sinon.stub(obj, 'stringProperty' as any); // TypeError!

  // ❌ BUG: Also missing restore
}

/**
 * BUG #8: Double-stubbing without restore
 * ❌ VIOLATION: stub-must-restore
 * IMPACT: TypeError: Attempted to wrap [method] which is already wrapped
 */
export function doubleStubbing() {
  const obj = {
    method: () => 'original'
  };

  // First stub
  const stub1 = sinon.stub(obj, 'method');
  stub1.returns('first');

  // ❌ BUG: Attempting to stub again without restore
  const stub2 = sinon.stub(obj, 'method'); // TypeError: already wrapped!
  stub2.returns('second');

  // ❌ BUG: Missing restore on both stubs
}

/**
 * BUG #9: Missing spy.restore()
 * ❌ VIOLATION: spy-must-restore
 * IMPACT: TypeError: Attempted to wrap [method] which is already wrapped
 */
export function missingSpyRestore() {
  const obj = {
    method: () => 'original'
  };

  const spy = sinon.spy(obj, 'method');
  obj.method();

  // Verify spy was called
  console.log('Spy called:', spy.called);

  // ❌ BUG: Missing spy.restore()
  // Should be: spy.restore();
}

/**
 * BUG #10: Invalid returnsArg index
 * ❌ VIOLATION: stub-returns-arg-invalid-index
 * IMPACT: TypeError: index unavailable (v6.1.2+)
 */
export function invalidReturnsArgIndex() {
  const stub = sinon.stub();

  // Configure to return argument at index 5
  stub.returnsArg(5);

  // ❌ BUG: Called with only 2 arguments, index 5 doesn't exist
  const result = stub('arg1', 'arg2'); // TypeError!

  // ❌ BUG: Also missing cleanup
  stub.reset();
}

/**
 * BUG #11: callsArg with non-function argument
 * ❌ VIOLATION: stub-calls-arg-not-function
 * IMPACT: TypeError: index missing or not a function
 */
export function callsArgNotFunction() {
  const stub = sinon.stub();
  stub.callsArg(0); // Expects first argument to be a function

  // ❌ BUG: Called with non-function first argument
  stub('not a function'); // TypeError!

  stub.reset();
}

/**
 * BUG #12: yields without callback argument
 * ❌ VIOLATION: stub-yields-no-callback
 * IMPACT: Error: stub was never called with a function argument
 */
export function yieldsWithoutCallback() {
  const stub = sinon.stub();
  stub.yields('error', null);

  // ❌ BUG: Called without a callback function
  stub('not a function'); // Error: stub was never called with a function argument

  stub.reset();
}

/**
 * BUG #13: No cleanup in standalone test (no afterEach)
 * ❌ VIOLATION: stub-must-restore
 * IMPACT: Test pollution in subsequent tests
 */
export function noCleanupInStandaloneTest() {
  const obj = {
    method: () => 'original'
  };

  const stub = sinon.stub(obj, 'method');
  stub.returns('stubbed');

  const result = obj.method();
  console.log('Result:', result);

  // ❌ BUG: Missing stub.restore() - no try-finally, no afterEach
  // Should use: try { ... } finally { stub.restore(); }
}

/**
 * BUG #14: No clock cleanup in standalone test
 * ❌ VIOLATION: fake-timers-must-restore
 * IMPACT: Timer pollution in subsequent tests
 */
export function noClockCleanupInStandaloneTest() {
  const clock = sinon.useFakeTimers();

  let called = false;
  setTimeout(() => { called = true; }, 1000);
  clock.tick(1000);

  console.log('Called:', called);

  // ❌ BUG: Missing clock.restore() - no try-finally, no afterEach
  // Should use: try { ... } finally { clock.restore(); }
}

/**
 * BUG #15: Accessing spy.lastCall without check
 * ❌ VIOLATION: spy-first-call-null-access (applies to lastCall too)
 * IMPACT: TypeError: Cannot read property 'args' of null
 */
export function accessingLastCallWithoutCheck() {
  const spy = sinon.spy();

  // Spy is never called

  // ❌ BUG: Accessing lastCall without checking spy.called
  const lastArg = spy.lastCall.args[0]; // TypeError!
  console.log('Last argument:', lastArg);
}

/**
 * BUG #16: Accessing spy.getCall(n) without bounds check
 * ❌ VIOLATION: spy-first-call-null-access (applies to getCall too)
 * IMPACT: TypeError if getCall returns null/undefined
 */
export function accessingGetCallWithoutCheck() {
  const spy = sinon.spy();

  // Spy is called once
  spy('arg1');

  // ❌ BUG: Accessing getCall(5) when only called once
  const fifthCall = spy.getCall(5); // May be null/undefined
  if (fifthCall) {
    console.log('Fifth call args:', fifthCall.args);
  }
}

/**
 * BUG #17: createStubInstance without cleanup
 * ❌ VIOLATION: create-stub-instance-double-use
 * IMPACT: TypeError: Attempted to wrap [method] which is already wrapped
 */
export function createStubInstanceWithoutCleanup() {
  class MyClass {
    method() {
      return 'original';
    }
  }

  // First stub instance
  const instance1 = sinon.createStubInstance(MyClass);
  instance1.method.returns('stubbed1');

  // ❌ BUG: Creating second stub instance without cleanup
  const instance2 = sinon.createStubInstance(MyClass); // May cause issues
  instance2.method.returns('stubbed2');

  // ❌ BUG: No cleanup for stub instances
}

/**
 * BUG #18: Multiple stubs without cleanup in same test
 * ❌ VIOLATION: stub-must-restore (multiple violations)
 * IMPACT: All stubs leak into subsequent tests
 */
export function multipleStubsWithoutCleanup() {
  const obj1 = { method: () => 'original1' };
  const obj2 = { method: () => 'original2' };
  const obj3 = { method: () => 'original3' };

  // ❌ BUG: Creating multiple stubs without tracking or cleanup
  sinon.stub(obj1, 'method').returns('stubbed1');
  sinon.stub(obj2, 'method').returns('stubbed2');
  sinon.stub(obj3, 'method').returns('stubbed3');

  // Use the stubs
  obj1.method();
  obj2.method();
  obj3.method();

  // ❌ BUG: No cleanup for any of the stubs
  // Should use sandbox for automatic cleanup
}

/**
 * BUG #19: Missing cleanup in async test
 * ❌ VIOLATION: fake-timers-must-restore
 * IMPACT: Clock not restored before test completes
 */
export async function missingClockCleanupInAsyncTest() {
  const clock = sinon.useFakeTimers();

  let resolved = false;

  // Fire async function
  (async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    resolved = true;
  })();

  await clock.tickAsync(1000);

  console.log('Resolved:', resolved);

  // ❌ BUG: Missing clock.restore() in async test
  // Should be: clock.restore();
}

/**
 * BUG #20: Sandbox creation without any cleanup mechanism
 * ❌ VIOLATION: sandbox-must-restore
 * IMPACT: All fakes leak into subsequent code
 */
export function sandboxWithoutCleanupMechanism() {
  const sandbox = sinon.createSandbox();

  const obj = { method: () => 'original' };
  sandbox.stub(obj, 'method').returns('stubbed');

  obj.method();

  // ❌ BUG: No afterEach, no try-finally, no cleanup at all
  // Sandbox created but never restored
}
