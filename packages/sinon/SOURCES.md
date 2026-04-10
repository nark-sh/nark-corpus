# Sources: sinon Package Contract

**Package:** sinon
**Version Range:** >=1.0.0
**Last Updated:** 2026-02-27

---

## Overview

Sinon.JS is a standalone test double library for JavaScript that provides spies, stubs, and mocks with no dependencies. It works with any unit testing framework. The library enables developers to test asynchronous code, control time, and verify function behaviors without relying on external services or complex setup.

**Key Features:**
- Spies: Track function calls, arguments, return values, and exceptions
- Stubs: Replace functions with controlled behavior for testing
- Mocks: Pre-programmed expectations with built-in assertions
- Fake Timers: Control setTimeout, setInterval, Date, and process.nextTick
- Fake XHR/Servers: Control AJAX requests and HTTP responses
- Sandboxes: Simplified cleanup and state management

---

## Primary Error Patterns

### 1. Missing Restore Calls

**Problem:** Stubs, spies, and fake timers that are not restored cause test pollution and "already wrapped" errors in subsequent tests.

**Common Manifestations:**
- TypeError: "Attempted to wrap [method] which is already wrapped"
- Tests fail when run together but pass in isolation
- Stub behavior persists across test boundaries
- Memory leaks from unreleased test doubles

**Documentation Reference:**
> "Sandboxes remove the need to keep track of every fake created, which greatly simplifies cleanup."
> — [Sinon Sandbox Documentation](https://sinonjs.org/releases/latest/sandbox/)

> "Restore the faked methods."
> — [Sinon Fake Timers Documentation](https://sinonjs.org/releases/latest/fake-timers/)

**Best Practice Pattern:**
```typescript
// Using sandboxes (recommended)
const sandbox = sinon.createSandbox();

beforeEach(() => {
  sandbox.stub(obj, 'method');
});

afterEach(() => {
  sandbox.restore(); // REQUIRED - prevents test pollution
});

// Manual cleanup (less recommended)
let stub: sinon.SinonStub;

beforeEach(() => {
  stub = sinon.stub(obj, 'method');
});

afterEach(() => {
  stub.restore(); // REQUIRED
});

// Fake timers cleanup (critical)
let clock: sinon.SinonFakeTimers;

beforeEach(() => {
  clock = sinon.useFakeTimers();
});

afterEach(() => {
  clock.restore(); // REQUIRED - prevents timer pollution
});
```

**Real-World Impact:** This is the most common Sinon error, affecting an estimated 30-40% of test suites that use manual cleanup instead of sandboxes.

---

### 2. Double-Stubbing Without Restore

**Problem:** Attempting to stub a method that is already stubbed throws a TypeError.

**Error Message:**
```
TypeError: Attempted to wrap [method] which is already wrapped
```

**GitHub Issues:**
- [Issue #1673](https://github.com/sinonjs/sinon/issues/1673): "Attempted to wrap send which is already wrapped" occurs when running multiple test files
- [Issue #1682](https://github.com/sinonjs/sinon/issues/1682): Using `sinon.stub(redis)` throws "Attempted to wrap getBuiltinCommands which is already wrapped"
- [Issue #1775](https://github.com/sinonjs/sinon/issues/1775): Default sandbox's restore method does not restore stubs properly, causing subsequent stubs to fail
- [Issue #852](https://github.com/sinonjs/sinon/issues/852): `sinon.createStubInstance` cannot be used twice on the same constructor
- [Issue #1721](https://github.com/sinonjs/sinon/issues/1721): Multiple reports of "Attempted to wrap [...] which is already wrapped"

**Root Cause:** Sinon tracks wrapped methods and prevents double-wrapping to avoid undefined behavior. When `restore()` is not called, or when the restore mechanism fails, subsequent stub attempts trigger this error.

**Prevention:**
```typescript
// BAD - double-stubbing
sinon.stub(obj, 'method').returns(1);
sinon.stub(obj, 'method').returns(2); // TypeError

// GOOD - restore first
const stub1 = sinon.stub(obj, 'method').returns(1);
stub1.restore();
const stub2 = sinon.stub(obj, 'method').returns(2);
stub2.restore();

// BETTER - use sandboxes
const sandbox = sinon.createSandbox();
sandbox.stub(obj, 'method').returns(1);
sandbox.restore(); // Cleans up all stubs
sandbox.stub(obj, 'method').returns(2);
```

---

### 3. Accessing Spy Calls Without Checking Existence

**Problem:** Accessing `spy.firstCall`, `spy.lastCall`, or `spy.getCall(n)` when the spy has not been called results in null/undefined access errors.

**Error Pattern:**
```typescript
const spy = sinon.spy();
// spy is never called
console.log(spy.firstCall.args); // TypeError: Cannot read property 'args' of null
```

**GitHub Issues:**
- [Issue #1476](https://github.com/sinonjs/sinon/issues/1476): `stub.firstCall` returns null when using `withArgs()`, even though `getCall(0)` works
- [Issue #1487](https://github.com/sinonjs/sinon/issues/1487): Incorrect returnValue when using `withArgs()` with `firstCall` or `lastCall`
- [Issue #1936](https://github.com/sinonjs/sinon/issues/1936): Default spy properties include `firstCall: null`

**Documentation Note:**
> "The recommended approach is going with spy.calledWith(arg1, arg2, ...) rather than direct array access, as this keeps tests less brittle."
> — [Sinon Spies Documentation](https://sinonjs.org/releases/latest/spies/)

**Safe Pattern:**
```typescript
const spy = sinon.spy();

// BAD - no existence check
if (spy.firstCall.args[0] === 'value') { ... } // May throw

// GOOD - check called first
if (spy.called && spy.firstCall.args[0] === 'value') { ... }

// BETTER - use assertion methods
if (spy.calledWith('value')) { ... }

// BEST - use sinon assertions
sinon.assert.calledWith(spy, 'value');
```

---

### 4. Mock Expectations Not Verified

**Problem:** Mocks with expectations that are never verified silently fail to enforce test assertions.

**Impact:** Tests pass even when expected behavior doesn't occur, resulting in false confidence.

**Documentation Reference:**
> "Verifies all expectations on the mock. If any expectation is not satisfied, an exception is thrown."
> — [Sinon Mocks Documentation](https://sinonjs.org/releases/latest/mocks/)

**Pattern:**
```typescript
// BAD - expectations never verified
const mock = sinon.mock(obj);
mock.expects('method').once();
obj.method(); // May or may not be called
// Test passes even if method wasn't called

// GOOD - verify expectations
const mock = sinon.mock(obj);
mock.expects('method').once();
obj.method();
mock.verify(); // Throws if expectation not met

// BETTER - use sandbox for automatic verification
const sandbox = sinon.createSandbox();
const mock = sandbox.mock(obj);
mock.expects('method').once();
obj.method();
sandbox.verifyAndRestore(); // Verifies and cleans up
```

**Best Practice Guidance:**
> "In general you should have no more than one mock (possibly with several expectations) in a single test."
> — [Sinon Mocks Best Practices](https://sinonjs.org/releases/latest/mocks/)

---

### 5. Fake Timer Cleanup Failures

**Problem:** Fake timers that are not restored cause time-based tests to behave unexpectedly and can break unrelated tests.

**Symptoms:**
- Tests hang waiting for real timers that never fire
- setTimeout/setInterval in subsequent tests execute immediately or never
- Date.now() returns frozen time in tests that should use real time

**Documentation Warning:**
> "Call clock.restore() in tearDown to restore the faked methods."
> — [Sinon Fake Timers Documentation](https://sinonjs.org/releases/latest/fake-timers/)

> "When faking nextTick, normal calls to process.nextTick() will not execute automatically. You must manually invoke clock.next(), clock.tick(), clock.runAll(), or clock.runToLast()."
> — [Sinon Fake Timers: Critical Considerations](https://sinonjs.org/releases/latest/fake-timers/)

**Pattern:**
```typescript
// BAD - no timer cleanup
it('test with fake timers', () => {
  const clock = sinon.useFakeTimers();
  // ... test code
  // Missing: clock.restore()
});

it('subsequent test', () => {
  setTimeout(() => console.log('fired'), 100); // Never fires!
});

// GOOD - proper cleanup
let clock: sinon.SinonFakeTimers;

beforeEach(() => {
  clock = sinon.useFakeTimers();
});

afterEach(() => {
  clock.restore(); // Critical for test isolation
});

// BETTER - use sandboxes
const sandbox = sinon.createSandbox({ useFakeTimers: true });

afterEach(() => {
  sandbox.restore(); // Restores timers automatically
});
```

---

### 6. Stubbing Non-Existent or Non-Function Properties

**Problem:** Attempting to stub a property that doesn't exist or is not a function throws a TypeError.

**Error Messages:**
```
TypeError: Attempted to wrap undefined property [name]
TypeError: An exception is thrown if the property is not already a function
```

**GitHub Issues:**
- [Issue #1762](https://github.com/sinonjs/sinon/issues/1762): "Attempted to wrap undefined property" when using `.spy()` on non-existent properties
- [Issue #470](https://github.com/sinonjs/sinon/issues/470): "Fails with unrelated error when non-existent method stubbed"

**Documentation Reference:**
> "An exception is thrown if the property is not already a function"
> — [Sinon Stubs Documentation](https://sinonjs.org/releases/latest/stubs/)

**Pattern:**
```typescript
const obj = { existingMethod: () => {} };

// BAD - stubbing non-existent property
sinon.stub(obj, 'nonExistent'); // TypeError

// BAD - stubbing non-function
const obj2 = { prop: 'value' };
sinon.stub(obj2, 'prop'); // TypeError

// GOOD - verify property exists and is a function
if (typeof obj.method === 'function') {
  sinon.stub(obj, 'method');
}

// BETTER - use type-safe approach
interface TestObj {
  method: () => void;
}
const obj: TestObj = { method: () => {} };
sinon.stub(obj, 'method'); // Type-checked
```

---

### 7. Stub Configuration Errors

**Problem:** Invalid stub configurations throw TypeErrors at runtime.

**Common Issues:**

**7a. Invalid Argument Index Access:**
```typescript
// stub.returnsArg(index) - TypeErrors for invalid index
const stub = sinon.stub();
stub.returnsArg(5); // No error until called with fewer args

stub(1, 2); // TypeError: index 5 unavailable
```

**Documentation:**
> "Prior to v6.1.2, returns undefined if index unavailable; v6.1.2+ throws TypeError"
> — [Sinon Stubs: stub.returnsArg()](https://sinonjs.org/releases/latest/stubs/)

**7b. Invalid Callback Index:**
```typescript
// stub.callsArg(index) - TypeError if not a function
const stub = sinon.stub();
stub.callsArg(0);

stub('not a function'); // TypeError: index missing or not a function
```

**7c. Missing Callback for yield():**
```typescript
const stub = sinon.stub();
stub.yields('arg1', 'arg2');

stub(); // Error: stub was never called with a function argument
```

**Documentation:**
> "If the stub was never called with a function argument, yield throws an error"
> — [Sinon Stubs: stub.yields()](https://sinonjs.org/releases/latest/stubs/)

---

### 8. Restoration Failures with Special Properties

**Problem:** Certain properties cannot be properly stubbed or restored, particularly in browser environments.

**GitHub Issues:**
- [Issue #1881](https://github.com/sinonjs/sinon/issues/1881): In IE11, stubbing window properties throws "Cannot redefine non-configurable property"
- [Issue #2226](https://github.com/sinonjs/sinon/issues/2226): Restoring stub fails when it executed `.value()` - throws TypeError
- [Issue #714](https://github.com/sinonjs/sinon/issues/714): Restoring spies/stubs of prototype functions of Element fails
- [Issue #2384](https://github.com/sinonjs/sinon/issues/2384): `sandbox.restore()` does not work on static members of functions/classes

**Specific Case - IE11 Window Properties:**
> "In IE11, it's possible to stub but not restore some properties in the window object, causing sinon to throw a TypeError: Cannot redefine non-configurable property"
> — [Issue #1881](https://github.com/sinonjs/sinon/issues/1881)

**Specific Case - .value() Stubs:**
> "When a stub is created with .value() method (like sinon.stub(mongoose.connection, 'readyState').value(1)), calling sinon.restore() throws a TypeError"
> — [Issue #2226](https://github.com/sinonjs/sinon/issues/2226)

**Workarounds:**
```typescript
// Check configurability before stubbing
if (Object.getOwnPropertyDescriptor(obj, 'prop')?.configurable) {
  sinon.stub(obj, 'prop');
}

// Avoid .value() stubs if restoration is needed
// Instead, use property accessors or replace the entire object
```

---

### 9. Async Test Cleanup Timing Issues

**Problem:** Sandbox restoration occurs before async tests complete, causing unpredictable behavior.

**GitHub Issue:**
- [Issue #1119](https://github.com/sinonjs/sinon/issues/1119): "sinon.test restores the sandbox before a promise-based async test is completed"

**Pattern:**
```typescript
// BAD - restoration races with async code
it('async test', async () => {
  const stub = sinon.stub(obj, 'method');
  const promise = asyncFunction(); // Uses stub
  stub.restore(); // Restored before promise resolves!
  await promise; // May fail
});

// GOOD - await before restore
it('async test', async () => {
  const stub = sinon.stub(obj, 'method');
  const result = await asyncFunction(); // Complete before restore
  stub.restore();
  return result;
});

// BETTER - use afterEach for cleanup
let stub: sinon.SinonStub;

beforeEach(() => {
  stub = sinon.stub(obj, 'method');
});

afterEach(() => {
  stub.restore(); // Runs after test completes
});

it('async test', async () => {
  return asyncFunction(); // Stub still active
});
```

---

### 10. Spy/Stub Conflicts with ES6 Classes

**Problem:** Stubbing ES6 class instances and static members has special behavior that can cause "already wrapped" errors.

**GitHub Issues:**
- [Issue #878](https://github.com/sinonjs/sinon/issues/878): "Stubbing and restoring do not work with ES6 class instances"
- [Issue #2029](https://github.com/sinonjs/sinon/issues/2029): "Separate stubs for class and its instance"
- [Issue #867](https://github.com/sinonjs/sinon/issues/867): "Prototype chain and stub breaking behaviors"

**Pattern:**
```typescript
class MyClass {
  method() { return 'original'; }
  static staticMethod() { return 'static'; }
}

// BAD - stubbing instance after createStubInstance
const instance = sinon.createStubInstance(MyClass);
sinon.stub(instance, 'method'); // TypeError: already wrapped

// GOOD - configure stubs during creation
const instance = sinon.createStubInstance(MyClass, {
  method: sinon.stub().returns('stubbed')
});

// BAD - static member restoration issues
sinon.stub(MyClass, 'staticMethod');
// ... may not restore properly with sandbox

// BETTER - use sandbox for all stubs
const sandbox = sinon.createSandbox();
sandbox.stub(MyClass, 'staticMethod');
sandbox.restore(); // More reliable for static members
```

---

## Stub API Reference

### Creation Methods

**Anonymous Stub:**
```typescript
const stub = sinon.stub();
```
Creates a standalone stub function with no behavior.

**Stub Object Method:**
```typescript
const stub = sinon.stub(object, "method");
```
Replaces `object.method` with a stub. Original function is not called.

**Restoration:** Must call `object.method.restore()` or `stub.restore()` to restore original.

**Stub All Methods:**
```typescript
const stub = sinon.stub(obj);
```
Stubs all methods on an object.

**Documentation Warning:**
> "It's usually better practice to stub individual methods to test intent precisely."
> — [Sinon Stubs: Best Practices](https://sinonjs.org/releases/latest/stubs/)

**Create Stub Instance:**
```typescript
const stub = sinon.createStubInstance(MyConstructor, overrides);
```
Creates a stub instance without invoking the constructor.

---

### Behavior Configuration

**Return Values:**
- `stub.returns(obj)` - Returns specified value
- `stub.returnsArg(index)` - Returns argument at index (throws TypeError if unavailable in v6.1.2+)
- `stub.returnsThis()` - Returns `this` context (for fluent APIs)

**Promises:**
- `stub.resolves(value)` - Returns Promise resolving to value
- `stub.resolvesArg(index)` - Returns Promise resolving to argument (throws TypeError if unavailable)
- `stub.rejects()` - Returns rejected Promise
- `stub.rejects("TypeError")` - Returns Promise rejected with typed exception

**Exceptions:**
- `stub.throws()` - Throws generic Error
- `stub.throws("name"[, "message"])` - Throws named exception
- `stub.throws(obj)` - Throws provided exception object
- `stub.throwsArg(index)` - Throws argument as exception (throws TypeError if unavailable)

**Callbacks:**
- `stub.callsArg(index)` - Invokes argument as callback (throws TypeError if not a function)
- `stub.callsArgWith(index, arg1, arg2)` - Invokes with arguments
- `stub.yields([arg1, arg2])` - Calls first function argument
- `stub.yieldsTo(property, [args])` - Invokes property callback

**Async Callbacks:**
All callback methods have async variants that defer using `process.nextTick` (Node) or `setTimeout(callback, 0)` (browser):
- `callsArgAsync()`, `callsArgWithAsync()`, `yieldsAsync()`, etc.

**Conditional Stubs:**
```typescript
stub.withArgs(arg1, arg2).returns(value);
```
Stubs method only for specific arguments. Uses deep comparison by default.

**Sequential Behavior:**
```typescript
stub.onCall(n); // Configure behavior for nth call
stub.onFirstCall();  // onCall(0)
stub.onSecondCall(); // onCall(1)
stub.onThirdCall();  // onCall(2)
```

**Custom Behavior:**
```typescript
stub.callsFake(fakeFunction);
```
Executes provided function when stub is invoked.

**Call Through:**
```typescript
stub.callThrough();
```
Calls original wrapped method when conditional stubs don't match.

---

### State Management

**Reset Methods:**
- `stub.reset()` - Resets behavior and call history
- `stub.resetBehavior()` - Resets to default behavior only
- `stub.resetHistory()` - Clears call history only

**Restoration:**
- `stub.restore()` - **CRITICAL:** Restores original method

**Batch Operations:**
```typescript
sinon.reset();          // All stubs
sinon.resetBehavior();  // All stubs
sinon.resetHistory();   // All stubs
```

---

## Spy API Reference

### Creation Methods

1. **Anonymous Spy:**
```typescript
const spy = sinon.spy();
```

2. **Function Wrapper:**
```typescript
const spy = sinon.spy(myFunc);
```

3. **Method Spy:**
```typescript
const spy = sinon.spy(object, "method");
```

4. **Property Accessor Spy:**
```typescript
const spy = sinon.spy(object, "property", ["get", "set"]);
```

---

### Call Information Properties

**Call Counters:**
- `spy.callCount` - Total number of calls
- `spy.called` - Boolean: at least one call
- `spy.notCalled` - Boolean: no calls
- `spy.calledOnce`, `spy.calledTwice`, `spy.calledThrice` - Exact counts

**Call Access (may be null if not called):**
- `spy.firstCall` - First call object (null if never called)
- `spy.secondCall` - Second call object
- `spy.thirdCall` - Third call object
- `spy.lastCall` - Last call object (null if never called)
- `spy.getCall(n)` - Get nth call (supports negative indexing)
- `spy.getCalls()` - Array of all call objects

**Call Data Arrays:**
- `spy.args[n]` - Arguments array for nth call
- `spy.thisValues[n]` - Context objects for each call
- `spy.exceptions[n]` - Exception data (undefined if no error)
- `spy.returnValues[n]` - Return values (undefined if none)

---

### Verification Methods

**Argument Matching:**
- `spy.calledWith(arg1, arg2)` - Checks if called with provided arguments
- `spy.calledWithExactly(...)` - Exact argument match
- `spy.calledOnceWith(...)` - Exactly one call with arguments
- `spy.alwaysCalledWith(...)` - All calls match arguments
- `spy.calledWithMatch(...)` - Matcher-based comparison

**Context Verification:**
- `spy.calledOn(obj)` - Verifies `this` context
- `spy.alwaysCalledOn(obj)` - All calls used target context
- `spy.calledWithNew()` - Detects constructor invocation

**Call Ordering:**
- `spy.calledBefore(anotherSpy)` - Temporal ordering
- `spy.calledAfter(anotherSpy)` - Reverse ordering
- `spy.calledImmediatelyBefore(anotherSpy)` - Sequential calls
- `spy.calledImmediatelyAfter(anotherSpy)` - Immediate successor

**Exception/Return Tracking:**
- `spy.threw()` - Returns true if spy threw exception
- `spy.threw("TypeError")` - Specific exception type check
- `spy.alwaysThrew()` - All invocations threw
- `spy.returned(obj)` - Verifies returned value
- `spy.alwaysReturned(obj)` - Consistent return verification

**Best Practice:**
> "The recommended approach is going with spy.calledWith(arg1, arg2, ...) rather than direct array access, as this keeps tests less brittle."
> — [Sinon Spies Documentation](https://sinonjs.org/releases/latest/spies/)

---

### Restoration

```typescript
spy.restore(); // Only for wrapped methods
spy.resetHistory(); // Clear call history
```

---

## Mock API Reference

### Creation and Expectations

**Create Mock:**
```typescript
const mock = sinon.mock(obj);
```
Returns a mock object for setting expectations. Does not change the original object.

**Set Expectation:**
```typescript
const expectation = mock.expects("method");
```
Overrides the method with a mock function and returns an expectation object.

---

### Expectation Methods (Chainable)

**Call Count Expectations:**
- `expectation.atLeast(number)` - Minimum call count
- `expectation.atMost(number)` - Maximum call count
- `expectation.exactly(number)` - Exact call count
- `expectation.never()` - Method should never be called
- `expectation.once()` - Exactly one call
- `expectation.twice()` - Exactly two calls
- `expectation.thrice()` - Exactly three calls

**Argument Expectations:**
- `expectation.withArgs(arg1, arg2)` - Called with these args (and possibly others)
- `expectation.withExactArgs(arg1, arg2)` - Called with only these exact args

**Context Expectations:**
- `expectation.on(obj)` - Called with specific `this` context

**Important Limitation:**
> "An expectation instance only holds onto a single set of arguments specified with withArgs or withExactArgs—subsequent calls overwrite previous specifications."
> — [Sinon Mocks Documentation](https://sinonjs.org/releases/latest/mocks/)

---

### Verification

**Verify All Expectations:**
```typescript
mock.verify();
```
Verifies all expectations on the mock. Throws an exception if any expectation is not satisfied. Also restores the mocked methods.

**Verify Individual Expectation:**
```typescript
expectation.verify();
```

**Consequence of Unmet Expectations:**
> "A mock will fail your test if it is not used as expected."
> — [Sinon Mocks Documentation](https://sinonjs.org/releases/latest/mocks/)

---

### Best Practices for Mocks

**Limit Mock Usage:**
> "In every unit test, there should be one unit under test. In general you should have no more than one mock (possibly with several expectations) in a single test."
> — [Sinon Mocks Best Practices](https://sinonjs.org/releases/latest/mocks/)

**Avoid Over-Specification:**
> "If you wouldn't add an assertion for some specific call, don't mock it. Use a stub instead. Mocks come with built-in expectations that may fail your test. Thus, they enforce implementation details."
> — [Sinon Mocks Best Practices](https://sinonjs.org/releases/latest/mocks/)

**When to Use Mocks:**
Employ mocks "if you want to control how your unit is being used and like stating expectations upfront."

---

## Sandbox API Reference

### Creation

**Basic Sandbox:**
```typescript
const sandbox = sinon.createSandbox();
```

**Configured Sandbox:**
```typescript
const sandbox = sinon.createSandbox({
  useFakeTimers: true,
  injectInto: facadeObject,
  properties: ["spy", "stub"]
});
```

**Default Sandbox (Sinon 5+):**
> "The sinon object itself functions as a default sandbox, eliminating the need for manual sandbox creation in most scenarios."
> — [Sinon Sandbox Documentation](https://sinonjs.org/releases/latest/sandbox/)

---

### Sandbox Methods

All standard Sinon methods are available on sandboxes:
- `sandbox.stub()`
- `sandbox.spy()`
- `sandbox.mock()`
- `sandbox.useFakeTimers()`
- `sandbox.createStubInstance()`
- `sandbox.replace()`, `sandbox.replaceGetter()`, `sandbox.replaceSetter()`

---

### Cleanup Methods

**Primary Methods:**
- `sandbox.restore()` - **CRITICAL:** Restores all fakes completely
- `sandbox.reset()` - Resets internal state of all fakes
- `sandbox.resetHistory()` - Clears call history only
- `sandbox.resetBehavior()` - Resets stub behaviors
- `sandbox.verify()` - Validates mock expectations
- `sandbox.verifyAndRestore()` - Both verification and cleanup

**Best Practice Integration:**
```typescript
describe("myAPI.hello", function() {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.stub(myAPI, "hello");
  });

  afterEach(() => {
    sandbox.restore(); // REQUIRED
  });

  it("should be called once", () => {
    // test code
  });
});
```

**Benefit:**
> "Sandboxes remove the need to keep track of every fake created, which greatly simplifies cleanup."
> — [Sinon Sandbox Documentation](https://sinonjs.org/releases/latest/sandbox/)

---

## Fake Timers API Reference

### Creation

**Basic Creation (starts at Unix epoch):**
```typescript
const clock = sinon.useFakeTimers();
```

**With Specific Timestamp:**
```typescript
const clock = sinon.useFakeTimers(now); // number or Date object
```

**With Configuration:**
```typescript
const clock = sinon.useFakeTimers({
  now: timestamp,
  toFake: ["setTimeout", "nextTick"], // Specific functions to fake
  shouldAdvanceTime: true, // Auto-advance based on system time
  global: globalObject // For Node/JSDOM environments
});
```

---

### Clock Control Methods

**Synchronous Methods:**
- `clock.tick(time)` - Advances clock by milliseconds; accepts "08" (8s) or "02:34:10" formats
- `clock.jump(time)` - Skips forward, fires callbacks at most once (simulates sleep/resume)
- `clock.next()` - Advances to the first scheduled timer
- `clock.runAll()` - Executes all pending timers until none remain

**Asynchronous Methods (for Promise-based code):**
- `await clock.tickAsync(time)` - Ticks while breaking event loop for promise execution
- `await clock.nextAsync()` - Advances asynchronously
- `await clock.runAllAsync()` - Runs all timers asynchronously

---

### Restoration (CRITICAL)

```typescript
clock.restore();
```

**Documentation Warning:**
> "Call clock.restore() in tearDown to restore the faked methods."
> — [Sinon Fake Timers Documentation](https://sinonjs.org/releases/latest/fake-timers/)

**Consequence of Missing Restoration:**
Fake timers persist across tests, causing:
- setTimeout/setInterval never fire in subsequent tests
- Date.now() returns frozen time
- process.nextTick() doesn't execute
- Tests hang waiting for real timers

---

### Critical Gotchas

**Process.nextTick Behavior:**
> "When faking nextTick, normal calls to process.nextTick() will not execute automatically. You must manually invoke clock.next(), clock.tick(), clock.runAll(), or clock.runToLast()."
> — [Sinon Fake Timers Documentation](https://sinonjs.org/releases/latest/fake-timers/)

**Async/Await Pattern:**
> "Using await on async functions without advancing the clock causes hangs; instead, call the function without awaiting, then use await clock.tickAsync()."
> — [Sinon Fake Timers Documentation](https://sinonjs.org/releases/latest/fake-timers/)

**Correct Pattern:**
```typescript
// BAD - hangs
await asyncFunction();
await clock.tick(1000);

// GOOD - fire and tick
asyncFunction(); // Don't await
await clock.tickAsync(1000);
```

---

## Common Vulnerability Patterns

### Test Pollution

**Issue:** Missing restore() calls cause test state to leak between tests.

**Impact:**
- Tests fail when run together but pass in isolation
- "Already wrapped" TypeErrors
- Flaky test suites
- False positives/negatives

**Prevention:**
```typescript
// Always use afterEach cleanup
afterEach(() => {
  sandbox.restore();
  clock.restore();
  sinon.restore(); // If using default sandbox
});
```

---

### Memory Leaks

**Issue:** Unreleased stubs, spies, and mocks accumulate in memory.

**Impact:**
- Increasing memory consumption over test runs
- Slower test execution
- Eventual out-of-memory errors in large suites

**Prevention:**
Use sandboxes for automatic cleanup management.

**Configuration:**
```typescript
const sandbox = sinon.createSandbox({
  assertOptions: {
    shouldLimitAssertionLogs: true,
    assertionLogLimit: 100
  }
});
```

---

### Race Conditions in Async Tests

**Issue:** Stubs restored before async code completes.

**Impact:** Unpredictable test failures, intermittent errors.

**Prevention:**
- Always await async operations before cleanup
- Use afterEach for cleanup, not inline restore()
- Avoid manual restore in the middle of async tests

---

## Severity Levels

### ERROR (Must Fix)

1. **Missing restore() on stubs/spies/mocks**
   - Causes test pollution
   - Blocks subsequent tests
   - TypeErrors: "already wrapped"

2. **Missing clock.restore() on fake timers**
   - Breaks all subsequent tests using timers
   - Causes test hangs
   - Tests may never complete

3. **Missing mock.verify()**
   - Expectations silently not enforced
   - False confidence in test coverage
   - Tests pass when they should fail

4. **Accessing spy calls without existence checks**
   - TypeError: Cannot read property 'args' of null
   - Runtime test failures
   - Brittle tests

### WARNING (Should Fix)

5. **Not using sandboxes for complex test suites**
   - Increased risk of cleanup errors
   - More maintenance overhead
   - Harder to track all fakes

6. **Over-using mocks instead of stubs**
   - Brittle tests tied to implementation
   - Harder to refactor
   - False failures on benign changes

7. **Stubbing entire objects instead of individual methods**
   - Less precise test intent
   - Potential for unexpected side effects
   - Harder to debug failures

---

## Version-Specific Behavior

### Sinon v6.1.2+

**Breaking Change:**
> "Prior to v6.1.2, returns undefined if index unavailable; v6.1.2+ throws TypeError"
> — [Sinon Stubs: stub.returnsArg()](https://sinonjs.org/releases/latest/stubs/)

Methods affected:
- `stub.returnsArg(index)`
- `stub.resolvesArg(index)`
- `stub.throwsArg(index)`
- `stub.callsArg(index)`

**Migration:** Add bounds checking when accessing arguments by index.

### Sinon v5.0+

**Default Sandbox:**
The `sinon` object itself became a default sandbox, reducing boilerplate for most use cases.

### Sinon v2.x → v3.x

**Prototype Changes:**
[Issue #867](https://github.com/sinonjs/sinon/issues/867) documents breaking changes in prototype chain handling for stubs.

---

## Additional Resources

**Official Documentation:**
- [Sinon.JS Homepage](https://sinonjs.org/)
- [API Documentation (v20.0.0)](https://sinonjs.org/releases/latest/)
- [Stubs Guide](https://sinonjs.org/releases/latest/stubs/)
- [Spies Guide](https://sinonjs.org/releases/latest/spies/)
- [Mocks Guide](https://sinonjs.org/releases/latest/mocks/)
- [Sandbox Guide](https://sinonjs.org/releases/latest/sandbox/)
- [Fake Timers Guide](https://sinonjs.org/releases/latest/fake-timers/)

**GitHub:**
- [Sinon Repository](https://github.com/sinonjs/sinon)
- [Issue Tracker](https://github.com/sinonjs/sinon/issues)

**NPM:**
- [sinon Package](https://www.npmjs.com/package/sinon)

---

## Summary

Sinon.JS test doubles are powerful tools for isolating unit tests, but they require careful cleanup management to avoid test pollution. The most common bugs stem from missing restore() calls on stubs, spies, and fake timers, leading to "already wrapped" TypeErrors and test isolation failures. Using sandboxes with proper afterEach cleanup is the recommended approach for most test suites. Always verify mock expectations, check spy call existence before accessing call properties, and ensure fake timers are restored to prevent cascading test failures.

**Key Takeaways:**
1. Always restore: stubs, spies, mocks, and fake timers
2. Use sandboxes for simplified cleanup management
3. Check spy.called before accessing spy.firstCall
4. Always call mock.verify() to enforce expectations
5. Avoid double-stubbing without restore
6. Be cautious with async test cleanup timing
7. Prefer stubbing individual methods over entire objects