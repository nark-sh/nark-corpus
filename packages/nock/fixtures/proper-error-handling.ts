/**
 * proper-error-handling.ts
 *
 * This fixture demonstrates CORRECT usage of nock with proper error handling,
 * cleanup, and scope verification. Should produce 0 violations.
 */

import nock from 'nock';
import http from 'http';

// ✅ GOOD: Proper setup with disableNetConnect
function setupNock() {
  nock.disableNetConnect();
}

// ✅ GOOD: Proper cleanup
function cleanupNock() {
  nock.cleanAll();
  nock.enableNetConnect();
}

// ✅ GOOD: Basic GET request with proper mock
async function fetchUserWithProperMock() {
  const scope = nock('https://api.example.com')
    .get('/users/123')
    .reply(200, { id: 123, name: 'Alice' });

  const response = await fetch('https://api.example.com/users/123');
  const data = await response.json();

  // Verify mock was used
  if (!scope.isDone()) {
    throw new Error('Mock was not used');
  }

  return data;
}

// ✅ GOOD: POST request with body matching
async function createUserWithProperMock() {
  const scope = nock('https://api.example.com')
    .post('/users', { name: 'Bob', email: 'bob@example.com' })
    .reply(201, { id: 456, name: 'Bob', email: 'bob@example.com' });

  const response = await fetch('https://api.example.com/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Bob', email: 'bob@example.com' })
  });

  const data = await response.json();

  if (!scope.isDone()) {
    throw new Error('Mock was not used');
  }

  return data;
}

// ✅ GOOD: Flexible body matching with function
async function createUserWithFlexibleMock() {
  const scope = nock('https://api.example.com')
    .post('/users', (body: any) => body.name === 'Charlie')
    .reply(201, { id: 789, name: 'Charlie' });

  const response = await fetch('https://api.example.com/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Charlie', email: 'charlie@example.com', timestamp: Date.now() })
  });

  const data = await response.json();

  if (!scope.isDone()) {
    throw new Error('Mock was not used');
  }

  return data;
}

// ✅ GOOD: Regex path matching
async function fetchUserWithRegex() {
  const scope = nock('https://api.example.com')
    .get(/\/users\/\d+/)
    .reply(200, { id: 100, name: 'Regex User' });

  const response = await fetch('https://api.example.com/users/100');
  const data = await response.json();

  if (!scope.isDone()) {
    throw new Error('Mock was not used');
  }

  return data;
}

// ✅ GOOD: Query parameter handling
async function searchUsersWithQueryParams() {
  const scope = nock('https://api.example.com')
    .get('/search')
    .query({ q: 'test', limit: 10 })
    .reply(200, [{ id: 1, name: 'Test User' }]);

  const response = await fetch('https://api.example.com/search?q=test&limit=10');
  const data = await response.json();

  if (!scope.isDone()) {
    throw new Error('Mock was not used');
  }

  return data;
}

// ✅ GOOD: Header matching
async function fetchWithAuthHeader() {
  const scope = nock('https://api.example.com')
    .get('/protected')
    .matchHeader('authorization', /^Bearer /)
    .reply(200, { protected: 'data' });

  const response = await fetch('https://api.example.com/protected', {
    headers: { 'authorization': 'Bearer token123' }
  });

  const data = await response.json();

  if (!scope.isDone()) {
    throw new Error('Mock was not used');
  }

  return data;
}

// ✅ GOOD: persist() with proper cleanup
async function persistentMockWithCleanup() {
  const scope = nock('https://api.example.com')
    .persist()
    .get('/persistent')
    .reply(200, { data: 'persistent' });

  // Make multiple requests
  await fetch('https://api.example.com/persistent');
  await fetch('https://api.example.com/persistent');
  await fetch('https://api.example.com/persistent');

  // Clean up persistent mock
  nock.cleanAll();

  return true;
}

// ✅ GOOD: Multiple scopes
async function multipleScopes() {
  const scope1 = nock('https://api.example.com')
    .get('/users')
    .reply(200, []);

  const scope2 = nock('https://api.example.com')
    .get('/posts')
    .reply(200, []);

  await fetch('https://api.example.com/users');
  await fetch('https://api.example.com/posts');

  if (!scope1.isDone() || !scope2.isDone()) {
    throw new Error('Not all mocks were used');
  }

  return true;
}

// ✅ GOOD: Error response testing
async function testErrorResponse() {
  const scope = nock('https://api.example.com')
    .get('/users/999')
    .reply(404, { error: 'User not found' });

  const response = await fetch('https://api.example.com/users/999');

  if (response.status !== 404) {
    throw new Error('Expected 404 status');
  }

  if (!scope.isDone()) {
    throw new Error('Mock was not used');
  }

  return true;
}

// ✅ GOOD: Complete test pattern with setup/cleanup
async function completeTestPattern() {
  // Setup
  setupNock();

  try {
    const scope = nock('https://api.example.com')
      .get('/data')
      .reply(200, { data: 'test' });

    const response = await fetch('https://api.example.com/data');
    const data = await response.json();

    // Verify
    if (!scope.isDone()) {
      const pending = nock.pendingMocks();
      throw new Error(`Pending mocks: ${pending.join(', ')}`);
    }

    return data;
  } finally {
    // Cleanup
    cleanupNock();
  }
}

// Export all functions for testing
export {
  setupNock,
  cleanupNock,
  fetchUserWithProperMock,
  createUserWithProperMock,
  createUserWithFlexibleMock,
  fetchUserWithRegex,
  searchUsersWithQueryParams,
  fetchWithAuthHeader,
  persistentMockWithCleanup,
  multipleScopes,
  testErrorResponse,
  completeTestPattern
};
