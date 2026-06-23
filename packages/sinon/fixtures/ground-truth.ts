/**
 * Ground-truth test fixtures for sinon contract.
 *
 * Each function is annotated with:
 *   @expect-violation: <postcondition-id>  — scanner SHOULD flag this
 *   @expect-clean                           — scanner SHOULD NOT flag this
 *
 * Depth pass 2026-04-20: covers fake() and sandbox.replace() postconditions.
 */

import sinon from 'sinon';

// ============================================================
// fake() — fake-non-function-arg-throws
// ============================================================

// @expect-violation: fake-non-function-arg-throws
function fakeWithStringArgument() {
  // WRONG: passing a string to sinon.fake() throws TypeError
  // TypeError: Expected f argument to be a Function
  const f = (sinon as any).fake('not-a-function');
  return f;
}

// @expect-violation: fake-non-function-arg-throws
function fakeWithObjectArgument() {
  // WRONG: passing a plain object to sinon.fake() throws TypeError
  const f = (sinon as any).fake({ value: 42 });
  return f;
}

// @expect-clean
function fakeWithNoArgument() {
  // Correct: blank fake
  const f = sinon.fake();
  return f;
}

// @expect-clean
function fakeWrappingExistingFunction() {
  // Correct: wrapping a real function
  const impl = (x: number) => x * 2;
  const f = sinon.fake(impl);
  return f;
}

// @expect-clean
function fakeViaFactory() {
  // Correct: preset return via factory — does NOT call fake() with non-function
  const f = sinon.fake.returns(42);
  return f;
}

// @expect-clean
function fakeResolveFactory() {
  // Correct: preset resolved promise via factory
  const f = sinon.fake.resolves({ data: 'ok' });
  return f;
}

// ============================================================
// fake.yields / fake.yieldsAsync — fake-yields-missing-callback
// ============================================================

// @expect-violation: fake-yields-missing-callback
function fakeYieldsCalledWithoutCallback() {
  const f = sinon.fake.yields('result');
  // WRONG: no callback as last argument — throws TypeError at invocation time
  f('some-arg');
}

// @expect-violation: fake-yields-missing-callback
function fakeYieldsAsyncCalledWithoutCallback() {
  const f = sinon.fake.yieldsAsync('result');
  // WRONG: no callback as last argument
  f('some-arg');
}

// @expect-clean
function fakeYieldsCalledWithCallback() {
  const f = sinon.fake.yields('result');
  // Correct: last arg is a callback function
  f('some-arg', (result: string) => console.log(result));
}

// ============================================================
// sandbox.replace() — replace-non-existent-property
// ============================================================

// @expect-violation: replace-non-existent-property
function replaceNonExistentProperty() {
  const sandbox = sinon.createSandbox();
  const obj = { existingMethod: () => 'original' };

  try {
    // WRONG: 'nonExistent' does not exist on obj
    // TypeError: Cannot replace non-existent property 'nonExistent'
    sandbox.replace(obj as any, 'nonExistent' as any, sinon.stub());
  } finally {
    sandbox.restore();
  }
}

// @expect-clean
function replaceExistingProperty() {
  const sandbox = sinon.createSandbox();
  const obj = { method: () => 'original' };

  try {
    // Correct: method exists on obj
    sandbox.replace(obj, 'method', sinon.stub().returns('stubbed'));
    obj.method();
  } finally {
    sandbox.restore();
  }
}

// ============================================================
// sandbox.replace() — replace-already-replaced-throws
// ============================================================

// @expect-violation: replace-already-replaced-throws
function replaceSamePropertyTwice() {
  const sandbox = sinon.createSandbox();
  const obj = { method: () => 'original' };

  try {
    sandbox.replace(obj, 'method', sinon.stub().returns('first'));
    // WRONG: replacing same property again without restore
    // TypeError: Attempted to replace 'method' which is already replaced
    sandbox.replace(obj, 'method', sinon.stub().returns('second'));
  } finally {
    sandbox.restore();
  }
}

// @expect-clean
function replaceDifferentPropertiesInSameSandbox() {
  const sandbox = sinon.createSandbox();
  const obj = { method1: () => 'original1', method2: () => 'original2' };

  try {
    // Correct: replacing different properties is fine
    sandbox.replace(obj, 'method1', sinon.stub().returns('stubbed1'));
    sandbox.replace(obj, 'method2', sinon.stub().returns('stubbed2'));
    obj.method1();
    obj.method2();
  } finally {
    sandbox.restore();
  }
}

// ============================================================
// sandbox.replace() — replace-type-mismatch-throws
// ============================================================

// @expect-violation: replace-type-mismatch-throws
function replaceStringWithNumber() {
  const sandbox = sinon.createSandbox();
  const obj = { value: 'original-string' };

  try {
    // WRONG: replacing string property with number
    // TypeError: Cannot replace string with number
    sandbox.replace(obj as any, 'value' as any, 42 as any);
  } finally {
    sandbox.restore();
  }
}

// @expect-clean
function replaceFunctionWithStub() {
  const sandbox = sinon.createSandbox();
  const obj = { fetch: () => Promise.resolve({ data: 'real' }) };

  try {
    // Correct: replacing function with stub (also a function)
    const stub = sandbox.stub().resolves({ data: 'stubbed' });
    sandbox.replace(obj, 'fetch', stub as any);
    return obj.fetch();
  } finally {
    sandbox.restore();
  }
}

// ============================================================
// sandbox.define() — define-existing-property-throws
// (deepen pass 2026-06-23, deepen-stream-3 pass 10)
// ============================================================

// @expect-violation: define-existing-property-throws
function defineOnExistingPropertyThrows() {
  const sandbox = sinon.createSandbox();
  const obj = { existingMethod: () => 'original' };

  try {
    // WRONG: defining a property that already exists
    // TypeError: Cannot define the already existing property 'existingMethod'
    (sandbox as any).define(obj, 'existingMethod', sandbox.stub().returns('stubbed'));
  } finally {
    sandbox.restore();
  }
}

// @expect-clean
function defineNewProperty() {
  const sandbox = sinon.createSandbox();
  const obj: { existing: string; newMethod?: () => string } = { existing: 'value' };

  try {
    // Correct: defining a NEW property (does not exist yet)
    (sandbox as any).define(obj, 'newMethod', sandbox.stub().returns('added'));
  } finally {
    sandbox.restore();
  }
}

// ============================================================
// sandbox.verify() — verify-unmet-expectation-throws
// (deepen pass 2026-06-23, deepen-stream-3 pass 10)
// ============================================================

// @expect-violation: verify-unmet-expectation-throws
function verifyWithoutTryFinally() {
  const sandbox = sinon.createSandbox();
  const obj = { method: () => 'result' };
  const mock = sandbox.mock(obj);
  mock.expects('method').once();

  // WRONG: bare verify() — if verification fails, restore() is skipped,
  // polluting subsequent tests with leftover sandbox state
  sandbox.verify();
  sandbox.restore(); // never reached if verify throws ExpectationError
}

// @expect-clean
function verifyWithTryFinally() {
  const sandbox = sinon.createSandbox();
  const obj = { method: () => 'result' };
  const mock = sandbox.mock(obj);
  mock.expects('method').once();

  try {
    // Correct: verify inside try/finally so restore always runs
    obj.method();
    sandbox.verify();
  } finally {
    sandbox.restore();
  }
}

// ============================================================
// sandbox.verifyAndRestore() — verify-and-restore-expectation-throws
// (deepen pass 2026-06-23, deepen-stream-3 pass 10)
// ============================================================

// @expect-violation: verify-and-restore-expectation-throws
function verifyAndRestoreSilentlySwallowed() {
  const sandbox = sinon.createSandbox();
  const obj = { method: () => 'result' };
  const mock = sandbox.mock(obj);
  mock.expects('method').once();

  // WRONG: swallow the ExpectationError — failing mocks pass CI undetected
  try {
    sandbox.verifyAndRestore();
  } catch {
    // silent swallow
  }
}

// @expect-clean
function verifyAndRestoreInAfterEach() {
  const sandbox = sinon.createSandbox();
  const obj = { method: () => 'result' };
  const mock = sandbox.mock(obj);
  mock.expects('method').once();

  obj.method();

  // Correct: let any ExpectationError propagate to the test framework.
  // sandbox.restore() is guaranteed by verifyAndRestore itself.
  sandbox.verifyAndRestore();
}

// @expect-clean
function verifyAndRestoreWithExplicitRecorder() {
  const sandbox = sinon.createSandbox();
  const obj = { method: () => 'result' };
  const mock = sandbox.mock(obj);
  mock.expects('method').once();

  obj.method();

  try {
    // Correct: explicit catch records the failure and re-throws
    sandbox.verifyAndRestore();
  } catch (e) {
    console.error('Mock verification failed:', e);
    throw e;
  }
}

// ============================================================
// sinon.restoreObject() — restore-object-falsy-input-throws
// (deepen pass 2026-06-23, deepen-stream-3 pass 10)
// ============================================================

// @expect-violation: restore-object-falsy-input-throws
function restoreObjectFalsyInput() {
  const maybeUndefined: { method: () => string } | undefined = undefined;
  // WRONG: no guard against undefined
  // Error: Trying to restore object but received undefined
  (sinon as any).restoreObject(maybeUndefined);
}

// @expect-violation: restore-object-falsy-input-throws
function restoreObjectNullInput() {
  const maybeNull: { method: () => string } | null = null;
  // WRONG: passing null directly
  // Error: Trying to restore object but received null
  (sinon as any).restoreObject(maybeNull);
}

// @expect-clean
function restoreObjectWithGuard() {
  const target: { method: () => string } | undefined = { method: () => 'real' };
  // Correct: truthy check before restoreObject
  if (target) {
    (sinon as any).restoreObject(target);
  }
}

// @expect-clean
function restoreObjectInCleanupLoop() {
  const targets: Array<{ method: () => string } | undefined> = [
    { method: () => 'a' },
    undefined,
    { method: () => 'c' },
  ];
  // Correct: defensive try/catch in cleanup loop
  for (const t of targets) {
    try {
      (sinon as any).restoreObject(t);
    } catch {
      /* already cleared or never set */
    }
  }
}
