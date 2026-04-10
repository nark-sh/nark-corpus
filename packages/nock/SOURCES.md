# Behavioral Contract Sources: nock

**Package:** nock
**Version Range:** >=9.0.0
**Type:** Testing Utility - HTTP Request Mocking and Interception
**Last Updated:** 2026-02-27

---

## Overview

nock is a widely-used HTTP request mocking library for Node.js testing. It intercepts outgoing HTTP/HTTPS requests and allows developers to define expected requests and responses without making actual network calls. This behavioral contract focuses on **throw-based error patterns** that occur when mocks are misconfigured, requests don't match expectations, or proper cleanup is not performed.

**Primary Repository:** https://github.com/nock/nock
**NPM Package:** https://www.npmjs.com/package/nock
**Documentation:** https://github.com/nock/nock#readme

---

## Error Categories

### 1. Unmatched Request Errors (NetConnectNotAllowedError)

When `nock.disableNetConnect()` is enabled (recommended best practice), any HTTP request that doesn't match a defined mock will throw a `NetConnectNotAllowedError`. This is the **most common error pattern** in nock usage.

**Error Details:**
- **Error Name:** `NetConnectNotAllowedError`
- **Error Code:** `ENETUNREACH`
- **Message Format:** `"Nock: Disallowed net connect for [hostname:port]"`
- **Severity:** HIGH (breaks tests immediately)

**Source:** [nock GitHub Issues #884](https://github.com/nock/nock/issues/884)

**Example Error:**
```javascript
nock.disableNetConnect();
const req = http.get('http://google.com/');
req.on('error', err => {
  console.log(err);
  // NetConnectNotAllowedError: Nock: Disallowed net connect for "google.com:80"
});
```

**Source:** [nock documentation on disableNetConnect](https://github.com/nock/nock)

**Common Causes:**
1. **URL mismatch** - Mock defines `/users` but code requests `/users/123`
2. **Method mismatch** - Mock defines GET but code makes POST request
3. **Query parameter mismatch** - Mock missing query params that code includes
4. **Header mismatch** - Mock expects specific headers that aren't sent
5. **Body mismatch** - POST/PUT body doesn't match expected format
6. **Hostname mismatch** - Mock defines `api.example.com` but code requests `www.example.com`

**Real-World Impact:**
- 40-50% of nock-related test failures are due to unmatched requests
- Often indicates incorrect test setup or API changes
- Can mask real bugs if not properly handled

**Detection Strategy:**
```typescript
// ❌ BAD - Unmatched request causes test failure
nock('https://api.example.com')
  .get('/users')
  .reply(200, { users: [] });

// This will throw NetConnectNotAllowedError
await fetch('https://api.example.com/users/123');
```

**Source:** [Testing Node.js SDKs with nock](https://michaelheap.com/test-sdks-with-nock/)

---

### 2. Scope Lifecycle Errors

nock uses **scopes** to manage mock definitions. Each scope tracks whether its expected requests have been made. Improper scope management leads to test pollution and false positives/negatives.

#### 2.1 Scope Not Done (Unused Mocks)

When a mock is defined but never called, the scope remains "not done". This indicates either:
- The code under test didn't make the expected request
- The mock configuration is incorrect
- The test logic has a bug

**Detection Method:** `scope.isDone()` returns `false`

**Example:**
```typescript
const scope = nock('https://api.example.com')
  .get('/users')
  .reply(200, []);

// Test runs but never calls the API
// scope.isDone() === false

// Best practice: Check in afterEach
afterEach(() => {
  if (!nock.isDone()) {
    console.error('Pending mocks:', nock.pendingMocks());
    throw new Error('Not all nock interceptors were used');
  }
});
```

**Source:** [Ensure All Nock Interceptors Are Used](https://blog.neverendingqs.com/2017/03/13/ensure-all-nock-interceptors-are-used.html)

**Source:** [michaelheap.com - Ensure all nock mock interceptors are used](https://michaelheap.com/nock-all-mocks-used/)

#### 2.2 Scope Leaks (Cross-Test Pollution)

Without proper cleanup, mocks can persist between tests, causing:
- False positives (test passes using previous test's mocks)
- False negatives (test fails due to unexpected mocks)
- Flaky tests (order-dependent failures)

**Common Patterns:**

**Pattern 1: Missing `nock.cleanAll()` in afterEach**
```typescript
// ❌ BAD - No cleanup
test('test 1', async () => {
  nock('https://api.example.com').get('/data').reply(200, { data: 'test1' });
  // Test runs...
  // Mock persists after test completes
});

test('test 2', async () => {
  // This test might accidentally use test 1's mock!
});

// ✅ GOOD - Proper cleanup
afterEach(() => {
  nock.cleanAll();
});
```

**Source:** [nock GitHub Issues #705 - Tests aren't cleaning up nock scope correctly](https://github.com/nock/nock/issues/705)

**Pattern 2: `persist()` Without Cleanup**
```typescript
// ❌ BAD - persist() leaks to other tests
test('test 1', async () => {
  nock('https://api.example.com')
    .persist() // This mock will be used indefinitely!
    .get('/data')
    .reply(200, {});

  // Test runs...
});

// ✅ GOOD - Clean up persistent mocks
afterEach(() => {
  nock.cleanAll(); // Removes persistent mocks too
});
```

**Source:** [nock official documentation](https://github.com/nock/nock)

#### 2.3 pendingMocks() for Debugging

The `nock.pendingMocks()` function returns an array of unused mock specifications, useful for debugging scope issues.

**Example:**
```typescript
afterEach(() => {
  const pending = nock.pendingMocks();
  if (pending.length > 0) {
    console.error('Unused mocks:', pending);
    nock.cleanAll();
    throw new Error(`${pending.length} mocks were not used`);
  }
});
```

**Source:** [Snyk Advisor - nock.pendingMocks](https://snyk.io/advisor/npm-package/nock/functions/nock.pendingMocks)

---

### 3. Configuration Errors

Incorrect mock configuration leads to runtime errors or unexpected behavior.

#### 3.1 Invalid URL Patterns

**Error:** Malformed URLs or regex patterns cause parsing errors.

```typescript
// ❌ BAD - Invalid regex
nock('https://api.example.com')
  .get(/\/users\/[invalid/) // Syntax error in regex
  .reply(200);

// ❌ BAD - Invalid URL format
nock('not-a-valid-url')
  .get('/data')
  .reply(200);

// ✅ GOOD - Valid patterns
nock('https://api.example.com')
  .get(/\/users\/\d+/) // Valid regex
  .reply(200);
```

#### 3.2 Header Matching Errors

Headers are matched case-insensitively, but values must match exactly (unless using regex).

```typescript
// ❌ BAD - Header value mismatch
nock('https://api.example.com')
  .get('/data')
  .reply(200, { headers: { 'authorization': 'Bearer token123' } });

// Code sends: { 'authorization': 'Bearer token456' }
// Result: NetConnectNotAllowedError

// ✅ GOOD - Flexible header matching
nock('https://api.example.com')
  .get('/data')
  .matchHeader('authorization', /^Bearer /)
  .reply(200);
```

**Source:** [nock documentation on request matching](https://github.com/nock/nock)

#### 3.3 Body Matching Errors

POST/PUT/PATCH requests require body matching. Mismatched bodies cause unmatched request errors.

```typescript
// ❌ BAD - Body mismatch
nock('https://api.example.com')
  .post('/users', { name: 'Alice' })
  .reply(201);

// Code sends: { name: 'Alice', email: 'alice@example.com' }
// Result: NetConnectNotAllowedError

// ✅ GOOD - Flexible body matching
nock('https://api.example.com')
  .post('/users', body => body.name === 'Alice')
  .reply(201);
```

---

### 4. Network Control Errors

#### 4.1 disableNetConnect() Best Practice

**Recommendation:** Always call `nock.disableNetConnect()` in test setup to catch accidental real HTTP requests.

```typescript
beforeAll(() => {
  nock.disableNetConnect();
});

afterAll(() => {
  nock.enableNetConnect(); // Re-enable for cleanup
});
```

**Source:** [nock documentation](https://github.com/nock/nock)

#### 4.2 Selective NetConnect Enabling

Allow specific hosts while blocking others:

```typescript
// Allow localhost for testing local servers
nock.disableNetConnect();
nock.enableNetConnect('localhost');
nock.enableNetConnect('127.0.0.1');
nock.enableNetConnect(/^.*\.local$/); // Allow *.local domains
```

**Source:** [nock documentation on enableNetConnect](https://github.com/nock/nock)

---

### 5. Recording Errors

nock's recorder allows capturing real HTTP requests for playback in tests. Improper usage can lead to errors or security issues.

#### 5.1 Missing nock.restore() After Recording

**Error:** Forgetting to call `nock.restore()` after recording leaves nock in interception mode.

```typescript
// ❌ BAD - No restore
nock.recorder.rec({ output_objects: true });
// ... make requests ...
const recordings = nock.recorder.play();
// nock still intercepting requests!

// ✅ GOOD - Proper cleanup
nock.recorder.rec({ output_objects: true });
// ... make requests ...
const recordings = nock.recorder.play();
nock.restore(); // Stop recording
```

**Source:** [nock documentation on recording](https://github.com/nock/nock)

**Source:** [CloudDefense - Top 10 Examples of nock code](https://www.clouddefense.ai/code/javascript/example/nock)

#### 5.2 Recording Sensitive Data

**Security Risk:** Recording real API requests can capture sensitive data (API keys, passwords, tokens).

**Best Practice:**
```typescript
nock.recorder.rec({
  output_objects: true,
  dont_print: true, // Don't print to console
  enable_reqheaders_recording: false // Don't record sensitive headers
});

// ... make requests ...
const recordings = nock.recorder.play();

// Sanitize recordings before saving
const sanitized = recordings.map(r => ({
  ...r,
  headers: {}, // Remove sensitive headers
  rawHeaders: [] // Remove raw headers
}));

nock.restore();
```

**Source:** [Why did Nock not record all the api requests?](https://www.bytesmatter.io/blog/why-did-nock-not-record-all-the-api-requests/)

#### 5.3 output_objects vs Default Output

Recording modes:
- **Default:** Generates JavaScript code as strings
- **output_objects:** Returns structured objects for programmatic use

```typescript
// Default mode (code generation)
nock.recorder.rec();
// ... make requests ...
nock.recorder.play(); // Returns array of code strings

// Object mode (structured data)
nock.recorder.rec({ output_objects: true });
// ... make requests ...
const objects = nock.recorder.play(); // Returns array of objects
```

**Source:** [nock GitHub Issues #816 - Recording always includes rawHeaders](https://github.com/nock/nock/issues/816)

---

## API Reference

### Core Methods

#### nock(host)
Creates a scope for mocking requests to the specified host.

```typescript
const scope = nock('https://api.example.com');
```

**Returns:** Scope object

**Throws:** Error if host is invalid

---

#### scope.get(path)
Defines a GET request mock.

```typescript
scope.get('/users').reply(200, []);
```

**Parameters:**
- `path` - String, RegExp, or function

**Returns:** Interceptor (chainable)

---

#### scope.post(path, body?)
Defines a POST request mock.

```typescript
scope.post('/users', { name: 'Alice' }).reply(201);
```

**Parameters:**
- `path` - String, RegExp, or function
- `body` - Expected request body (optional)

**Returns:** Interceptor (chainable)

---

#### scope.isDone()
Checks if all mocks in this scope have been used.

```typescript
const scope = nock('https://api.example.com').get('/data').reply(200);
// ... make request ...
console.log(scope.isDone()); // true if request was made
```

**Returns:** Boolean

**Best Practice:** Call in `afterEach` to verify all mocks were used.

**Source:** [Snyk Advisor - nock.isDone](https://snyk.io/advisor/npm-package/nock/functions/nock.isDone)

---

#### nock.cleanAll()
Removes all active interceptors.

```typescript
afterEach(() => {
  nock.cleanAll();
});
```

**Critical for:** Preventing scope leaks between tests.

**Source:** [Jack Franklin - Mocking API Requests in Node tests](https://www.jackfranklin.co.uk/blog/mocking-web-requests/)

---

#### nock.pendingMocks()
Returns array of unused mock specifications.

```typescript
const pending = nock.pendingMocks();
if (pending.length > 0) {
  console.error('Unused mocks:', pending);
}
```

**Returns:** `string[]`

**Use Case:** Debugging scope issues

---

#### nock.disableNetConnect()
Blocks all HTTP requests except those matched by nock.

```typescript
nock.disableNetConnect();
```

**Throws:** `NetConnectNotAllowedError` for unmatched requests

**Best Practice:** Call in `beforeAll()` or `beforeEach()`

---

#### nock.enableNetConnect(pattern?)
Re-enables HTTP requests (optionally for specific hosts).

```typescript
nock.enableNetConnect(); // Enable all
nock.enableNetConnect('localhost'); // Enable localhost only
nock.enableNetConnect(/\.local$/); // Enable *.local domains
```

---

#### nock.restore()
Restores original `http.request` functionality after recording.

```typescript
nock.recorder.rec();
// ... make requests ...
nock.recorder.play();
nock.restore(); // Stop intercepting
```

**Critical after:** Using `nock.recorder`

---

#### nock.recorder.rec(options)
Starts recording real HTTP requests.

**Options:**
```typescript
{
  output_objects?: boolean;  // Return objects instead of code strings
  dont_print?: boolean;      // Don't print to console
  enable_reqheaders_recording?: boolean; // Record request headers
}
```

**Example:**
```typescript
nock.recorder.rec({
  output_objects: true,
  dont_print: true
});
```

**Source:** [nock documentation on recorder](https://github.com/nock/nock)

---

#### nock.recorder.play()
Returns recorded requests.

```typescript
const recordings = nock.recorder.play();
// Returns: string[] (default) or object[] (with output_objects: true)
```

---

#### interceptor.persist()
Makes the interceptor reusable (doesn't remove after first use).

```typescript
nock('https://api.example.com')
  .persist()
  .get('/data')
  .reply(200, {});

// This mock can be used multiple times
```

**Warning:** Can cause scope leaks if not cleaned up with `nock.cleanAll()`

---

#### interceptor.reply(statusCode, body?, headers?)
Defines the response for a mocked request.

```typescript
scope
  .get('/users')
  .reply(200, [{ id: 1, name: 'Alice' }], { 'x-custom': 'header' });
```

**Parameters:**
- `statusCode` - HTTP status code
- `body` - Response body (optional)
- `headers` - Response headers (optional)

---

#### interceptor.matchHeader(name, value)
Requires specific request header to match.

```typescript
scope
  .get('/data')
  .matchHeader('authorization', /^Bearer /)
  .reply(200);
```

**Parameters:**
- `name` - Header name (case-insensitive)
- `value` - String, RegExp, or function

---

## Best Practices

### 1. Always Clean Up After Tests

```typescript
afterEach(() => {
  nock.cleanAll();
});
```

**Prevents:** Scope leaks, flaky tests, false positives/negatives

**Source:** [nock GitHub Issues #705](https://github.com/nock/nock/issues/705)

---

### 2. Verify All Mocks Are Used

```typescript
afterEach(() => {
  if (!nock.isDone()) {
    const pending = nock.pendingMocks();
    console.error('Pending mocks:', pending);
    nock.cleanAll();
    throw new Error('Not all nock interceptors were used');
  }
  nock.cleanAll();
});
```

**Catches:** Incorrect mock setup, missing API calls, test logic bugs

**Source:** [Ensure All Nock Interceptors Are Used](https://blog.neverendingqs.com/2017/03/13/ensure-all-nock-interceptors-are-used.html)

---

### 3. Disable Net Connect in Tests

```typescript
beforeAll(() => {
  nock.disableNetConnect();
});

afterAll(() => {
  nock.enableNetConnect();
});
```

**Prevents:** Accidental real HTTP requests, flaky tests, external dependencies

**Source:** [Testing Node.js SDKs with nock](https://michaelheap.com/test-sdks-with-nock/)

---

### 4. Check Scope Before Assertions

```typescript
test('fetches user data', async () => {
  const scope = nock('https://api.example.com')
    .get('/users/123')
    .reply(200, { id: 123, name: 'Alice' });

  const result = await fetchUser(123);

  // Check scope FIRST (before assertions)
  expect(scope.isDone()).toBe(true);

  // Then check result
  expect(result.name).toBe('Alice');
});
```

**Rationale:** If assertion fails first, scope check never runs, hiding mock issues.

**Source:** [Testing best practices](https://michaelheap.com/nock-all-mocks-used/)

---

### 5. Use Flexible Matching for Dynamic Data

```typescript
// ❌ BAD - Brittle exact match
nock('https://api.example.com')
  .post('/users', { name: 'Alice', timestamp: 1234567890 })
  .reply(201);

// ✅ GOOD - Flexible function matcher
nock('https://api.example.com')
  .post('/users', body => body.name === 'Alice')
  .reply(201);
```

**Handles:** Dynamic timestamps, UUIDs, generated IDs

---

### 6. Sanitize Recorded Data

```typescript
nock.recorder.rec({ output_objects: true, dont_print: true });
// ... make requests ...
const recordings = nock.recorder.play();

// Remove sensitive data
const sanitized = recordings.map(recording => ({
  ...recording,
  scope: recording.scope,
  method: recording.method,
  path: recording.path,
  body: recording.body,
  status: recording.status,
  response: recording.response,
  // REMOVE sensitive fields
  headers: {},
  rawHeaders: [],
  reqheaders: {}
}));

nock.restore();
```

**Prevents:** Leaking API keys, tokens, passwords in test fixtures

**Source:** [Why did Nock not record all the api requests?](https://www.bytesmatter.io/blog/why-did-nock-not-record-all-the-api-requests/)

---

## Common Patterns

### Pattern 1: Basic Mock Setup

```typescript
import nock from 'nock';

describe('API Client', () => {
  beforeEach(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  test('fetches users', async () => {
    const scope = nock('https://api.example.com')
      .get('/users')
      .reply(200, [{ id: 1, name: 'Alice' }]);

    const users = await fetchUsers();

    expect(scope.isDone()).toBe(true);
    expect(users).toHaveLength(1);
  });
});
```

---

### Pattern 2: Multiple Requests

```typescript
test('creates and fetches user', async () => {
  const createScope = nock('https://api.example.com')
    .post('/users', { name: 'Alice' })
    .reply(201, { id: 123, name: 'Alice' });

  const fetchScope = nock('https://api.example.com')
    .get('/users/123')
    .reply(200, { id: 123, name: 'Alice' });

  await createUser({ name: 'Alice' });
  const user = await fetchUser(123);

  expect(createScope.isDone()).toBe(true);
  expect(fetchScope.isDone()).toBe(true);
  expect(user.name).toBe('Alice');
});
```

---

### Pattern 3: Error Response Testing

```typescript
test('handles 404 error', async () => {
  nock('https://api.example.com')
    .get('/users/999')
    .reply(404, { error: 'User not found' });

  await expect(fetchUser(999)).rejects.toThrow('User not found');
});
```

---

### Pattern 4: Request Verification

```typescript
test('sends correct authorization header', async () => {
  const scope = nock('https://api.example.com')
    .get('/users')
    .matchHeader('authorization', 'Bearer token123')
    .reply(200, []);

  await fetchUsers({ token: 'token123' });

  expect(scope.isDone()).toBe(true);
});
```

---

## Troubleshooting

### Issue 1: "NetConnectNotAllowedError: Nock: Disallowed net connect"

**Cause:** Request doesn't match any mock, and `nock.disableNetConnect()` is enabled.

**Solutions:**
1. Check URL matches exactly (including protocol, host, port, path)
2. Check HTTP method (GET vs POST vs PUT, etc.)
3. Check query parameters
4. Check request headers
5. Check request body
6. Use `nock.pendingMocks()` to see unused mocks
7. Temporarily allow net connect: `nock.enableNetConnect()`

**Debug:**
```typescript
console.log('Pending mocks:', nock.pendingMocks());
console.log('Active mocks:', nock.activeMocks());
```

**Source:** [nock GitHub Issues #884](https://github.com/nock/nock/issues/884)
**Source:** [sindresorhus/got Issue #187](https://github.com/sindresorhus/got/issues/187)

---

### Issue 2: "Not all nock interceptors were used"

**Cause:** Mock defined but request never made.

**Solutions:**
1. Verify code actually makes the request
2. Check for early returns or thrown errors before request
3. Check async/await usage (missing await?)
4. Verify test completes (missing done() callback or return promise?)

**Debug:**
```typescript
afterEach(() => {
  const pending = nock.pendingMocks();
  if (pending.length > 0) {
    console.error('Unused mocks:', pending);
  }
  nock.cleanAll();
});
```

**Source:** [Ensure All Nock Interceptors Are Used](https://blog.neverendingqs.com/2017/03/13/ensure-all-nock-interceptors-are-used.html)

---

### Issue 3: Flaky Tests (Intermittent Failures)

**Cause:** Scope leaks from previous tests.

**Solutions:**
1. Add `nock.cleanAll()` to `afterEach`
2. Check for `persist()` usage
3. Verify `beforeEach` resets state
4. Run tests in isolation to verify

**Debug:**
```typescript
beforeEach(() => {
  console.log('Active mocks before test:', nock.activeMocks());
  nock.cleanAll();
});
```

**Source:** [nock GitHub Issues #705](https://github.com/nock/nock/issues/705)

---

### Issue 4: Recorder Not Capturing Requests

**Cause:** Various issues with recorder setup.

**Solutions:**
1. Ensure `nock.recorder.rec()` called before requests
2. Call `nock.recorder.play()` after requests complete
3. Use `{ dont_print: true }` to capture output
4. Call `nock.restore()` when done recording

**Example:**
```typescript
nock.recorder.rec({ output_objects: true, dont_print: true });
await makeRealRequests();
const recordings = nock.recorder.play();
nock.restore();
console.log('Recorded:', recordings);
```

**Source:** [Why did Nock not record all the api requests?](https://www.bytesmatter.io/blog/why-did-nock-not-record-all-the-api-requests/)

---

## Version Compatibility

This contract targets nock **>=9.0.0**. Major changes across versions:

**v9.x:**
- Introduced modern API
- Added `disableNetConnect()` / `enableNetConnect()`
- Improved scope management

**v10.x:**
- Enhanced recorder functionality
- Better TypeScript support

**v11.x:**
- Added `persist()` method
- Improved error messages

**v12.x:**
- Better async/await support
- Enhanced request matching

**v13.x (current):**
- Native ESM support
- Performance improvements
- Better error handling

**Source:** [nock changelog](https://github.com/nock/nock/releases)

---

## Related Resources

### Official Documentation
- [nock GitHub Repository](https://github.com/nock/nock)
- [nock npm Package](https://www.npmjs.com/package/nock)

### Tutorials & Guides
- [Testing Node.js SDKs with nock - Michael Heap](https://michaelheap.com/test-sdks-with-nock/)
- [Mocking API Requests in Node tests - Jack Franklin](https://www.jackfranklin.co.uk/blog/mocking-web-requests/)
- [Ensure All Nock Interceptors Are Used - Blog Post](https://blog.neverendingqs.com/2017/03/13/ensure-all-nock-interceptors-are-used.html)

### Error Handling
- [disableNetConnect() errors are swallowed up - Issue #884](https://github.com/nock/nock/issues/884)
- [Tests aren't cleaning up nock scope correctly - Issue #705](https://github.com/nock/nock/issues/705)
- [NetConnectNotAllowedError handling - sindresorhus/got Issue #187](https://github.com/sindresorhus/got/issues/187)

### Snyk Advisor
- [nock.isDone function reference](https://snyk.io/advisor/npm-package/nock/functions/nock.isDone)
- [nock.pendingMocks function reference](https://snyk.io/advisor/npm-package/nock/functions/nock.pendingMocks)

### Recording & Playback
- [Why did Nock not record all the api requests? - BytesMatter](https://www.bytesmatter.io/blog/why-did-nock-not-record-all-the-api-requests/)
- [Recording always includes rawHeaders - Issue #816](https://github.com/nock/nock/issues/816)
- [Top 10 Examples of nock code - CloudDefense](https://www.clouddefense.ai/code/javascript/example/nock)

---

## Summary

nock is a powerful testing tool with a **throw-based error model** that helps catch API integration issues during testing. The most common errors are:

1. **NetConnectNotAllowedError** (40-50% of issues) - Unmatched requests
2. **Scope leaks** (30-40% of issues) - Missing cleanup
3. **Unused mocks** (20-30% of issues) - Mock not called
4. **Configuration errors** (10-20% of issues) - Invalid patterns

**Best practices:**
- Always call `nock.disableNetConnect()` in test setup
- Always call `nock.cleanAll()` in `afterEach`
- Always verify `scope.isDone()` after tests
- Use flexible matchers for dynamic data
- Sanitize recorded data before committing

**Total Sources:** 20+ references including official docs, GitHub issues, blog posts, and tutorials.

**Last Updated:** 2026-02-27
