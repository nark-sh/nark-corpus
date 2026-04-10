/**
 * missing-error-handling.ts
 *
 * This fixture demonstrates INCORRECT usage of nock with missing error handling,
 * missing cleanup, and missing scope verification. Should produce multiple ERROR violations.
 */

import nock from 'nock';

// ❌ BAD: Missing disableNetConnect - real requests can leak through
async function fetchUserWithoutDisableNetConnect() {
  nock('https://api.example.com')
    .get('/users/123')
    .reply(200, { id: 123, name: 'Alice' });

  // If path doesn't match exactly, this makes a REAL HTTP request!
  const response = await fetch('https://api.example.com/users/456');
  return response.json();
}

// ❌ BAD: URL mismatch - NetConnectNotAllowedError
async function fetchUserWithURLMismatch() {
  nock.disableNetConnect();

  nock('https://api.example.com')
    .get('/users')  // Mocks /users
    .reply(200, []);

  // This will throw NetConnectNotAllowedError (path mismatch)
  const response = await fetch('https://api.example.com/users/123');
  return response.json();
}

// ❌ BAD: Query parameter mismatch - NetConnectNotAllowedError
async function searchWithoutQueryParams() {
  nock.disableNetConnect();

  nock('https://api.example.com')
    .get('/search')  // No query params mocked
    .reply(200, []);

  // This will throw NetConnectNotAllowedError (query params not mocked)
  const response = await fetch('https://api.example.com/search?q=test&limit=10');
  return response.json();
}

// ❌ BAD: Method mismatch - NetConnectNotAllowedError
async function createUserWithMethodMismatch() {
  nock.disableNetConnect();

  nock('https://api.example.com')
    .get('/users')  // Mocked as GET
    .reply(200, []);

  // This will throw NetConnectNotAllowedError (POST vs GET)
  const response = await fetch('https://api.example.com/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Bob' })
  });
  return response.json();
}

// ❌ BAD: Body mismatch - NetConnectNotAllowedError
async function createUserWithBodyMismatch() {
  nock.disableNetConnect();

  nock('https://api.example.com')
    .post('/users', { name: 'Alice' })  // Expects specific body
    .reply(201);

  // This will throw NetConnectNotAllowedError (body doesn't match)
  const response = await fetch('https://api.example.com/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Alice', email: 'alice@example.com' })
  });
  return response.json();
}

// ❌ BAD: Header mismatch - NetConnectNotAllowedError
async function fetchWithHeaderMismatch() {
  nock.disableNetConnect();

  nock('https://api.example.com')
    .get('/protected')
    .matchHeader('authorization', 'Bearer token123')
    .reply(200, {});

  // This will throw NetConnectNotAllowedError (different token)
  const response = await fetch('https://api.example.com/protected', {
    headers: { 'authorization': 'Bearer token456' }
  });
  return response.json();
}

// ❌ BAD: No scope.isDone() check - mock not used but test passes
async function missingIsDoneCheck() {
  const scope = nock('https://api.example.com')
    .get('/users')
    .reply(200, []);

  // Test runs but never calls the API
  // No scope.isDone() check - silent failure
  return true;
}

// ❌ BAD: No cleanup - scope leak
async function noCleanup() {
  nock('https://api.example.com')
    .persist()  // Persists indefinitely!
    .get('/data')
    .reply(200, { data: 'test' });

  await fetch('https://api.example.com/data');

  // Missing nock.cleanAll() - scope leaks to next test
}

// ❌ BAD: persist() without cleanup
async function persistWithoutCleanup() {
  nock('https://api.example.com')
    .persist()
    .get('/persistent')
    .reply(200, {});

  await fetch('https://api.example.com/persistent');

  // Mock persists forever without nock.cleanAll()
}

// ❌ BAD: Invalid regex pattern
async function invalidRegexPattern() {
  nock.disableNetConnect();

  // This will cause a syntax error
  nock('https://api.example.com')
    .get(/\/users\/[invalid/)  // Invalid regex syntax
    .reply(200, {});

  const response = await fetch('https://api.example.com/users/123');
  return response.json();
}

// ❌ BAD: Missing nock.restore() after recording
async function recordWithoutRestore() {
  nock.recorder.rec({ output_objects: true });

  // Make some requests...
  await fetch('https://api.example.com/data');

  const recordings = nock.recorder.play();

  // Missing nock.restore() - nock still intercepting!
  return recordings;
}

// ❌ BAD: Unmatched request in Jest (test passes but error after)
async function jestUnmatchedRequest() {
  nock('https://api.example.com')
    .get('/users')
    .reply(200, []);

  // In Jest, this might succeed but throw promise error after test completes
  const response = await fetch('https://api.example.com/users/123');
  return response.json();
}

// ❌ BAD: Missing pendingMocks check
async function missingPendingMocksCheck() {
  nock('https://api.example.com').get('/a').reply(200);
  nock('https://api.example.com').get('/b').reply(200);
  nock('https://api.example.com').get('/c').reply(200);

  // Only call one endpoint
  await fetch('https://api.example.com/a');

  // Missing check for pending mocks (/b and /c not used)
}

// ❌ BAD: Hostname mismatch
async function hostnameMismatch() {
  nock.disableNetConnect();

  nock('https://api.example.com')
    .get('/data')
    .reply(200, {});

  // This will throw NetConnectNotAllowedError (hostname mismatch)
  const response = await fetch('https://www.example.com/data');
  return response.json();
}

// ❌ BAD: Protocol mismatch
async function protocolMismatch() {
  nock.disableNetConnect();

  nock('https://api.example.com')  // HTTPS
    .get('/data')
    .reply(200, {});

  // This will throw NetConnectNotAllowedError (HTTP vs HTTPS)
  const response = await fetch('http://api.example.com/data');
  return response.json();
}

// ❌ BAD: Multiple mocks, some not used
async function multipleMocksSomeNotUsed() {
  const scope1 = nock('https://api.example.com').get('/a').reply(200);
  const scope2 = nock('https://api.example.com').get('/b').reply(200);
  const scope3 = nock('https://api.example.com').get('/c').reply(200);

  // Only call /a and /b
  await fetch('https://api.example.com/a');
  await fetch('https://api.example.com/b');

  // scope3 not used - no check for scope3.isDone()
}

// ❌ BAD: Recording sensitive data
async function recordSensitiveData() {
  nock.recorder.rec({
    output_objects: true,
    enable_reqheaders_recording: true  // Records auth headers!
  });

  await fetch('https://api.example.com/data', {
    headers: { 'authorization': 'Bearer secret-token-123' }
  });

  const recordings = nock.recorder.play();
  nock.restore();

  // Recordings contain sensitive auth token!
  return recordings;
}

// ❌ BAD: No afterEach cleanup pattern
function testWithoutAfterEach() {
  // Test 1
  nock('https://api.example.com').get('/data').reply(200, { test: 1 });

  // Test 2 (in same file)
  nock('https://api.example.com').get('/data').reply(200, { test: 2 });

  // No afterEach cleanup between tests - flaky results
}

// ❌ BAD: Missing try-catch for network errors
async function missingTryCatch() {
  nock.disableNetConnect();

  nock('https://api.example.com')
    .get('/users')
    .reply(200, []);

  // This will throw but no try-catch
  const response = await fetch('https://api.example.com/users/123');
  return response.json();
}

// Export all functions
export {
  fetchUserWithoutDisableNetConnect,
  fetchUserWithURLMismatch,
  searchWithoutQueryParams,
  createUserWithMethodMismatch,
  createUserWithBodyMismatch,
  fetchWithHeaderMismatch,
  missingIsDoneCheck,
  noCleanup,
  persistWithoutCleanup,
  invalidRegexPattern,
  recordWithoutRestore,
  jestUnmatchedRequest,
  missingPendingMocksCheck,
  hostnameMismatch,
  protocolMismatch,
  multipleMocksSomeNotUsed,
  recordSensitiveData,
  testWithoutAfterEach,
  missingTryCatch
};
