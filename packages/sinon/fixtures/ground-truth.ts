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
