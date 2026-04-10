/**
 * instance-usage.ts
 *
 * This fixture demonstrates instance-based usage patterns with nock scopes.
 * Tests detection of violations on scope methods and instance patterns.
 */

import nock, { Scope } from 'nock';

// ✅ GOOD: Scope instance with proper isDone check
async function scopeInstanceWithIsDoneCheck() {
  const scope: Scope = nock('https://api.example.com')
    .get('/users')
    .reply(200, []);

  const response = await fetch('https://api.example.com/users');
  const data = await response.json();

  if (!scope.isDone()) {
    throw new Error('Mock was not used');
  }

  return data;
}

// ❌ BAD: Scope instance without isDone check
async function scopeInstanceWithoutIsDoneCheck() {
  const scope: Scope = nock('https://api.example.com')
    .get('/users')
    .reply(200, []);

  // Test runs but never calls API
  // No scope.isDone() check - silent failure
  return true;
}

// ✅ GOOD: Multiple scope instances with proper verification
async function multipleScopeInstances() {
  const userScope: Scope = nock('https://api.example.com')
    .get('/users')
    .reply(200, []);

  const postScope: Scope = nock('https://api.example.com')
    .get('/posts')
    .reply(200, []);

  await fetch('https://api.example.com/users');
  await fetch('https://api.example.com/posts');

  if (!userScope.isDone() || !postScope.isDone()) {
    throw new Error('Not all mocks were used');
  }

  return true;
}

// ❌ BAD: Scope instance with persist() but no cleanup
async function scopeWithPersistNoCleanup() {
  const scope: Scope = nock('https://api.example.com')
    .persist()
    .get('/persistent')
    .reply(200, { data: 'persistent' });

  await fetch('https://api.example.com/persistent');

  // Missing nock.cleanAll() - scope persists indefinitely
}

// ✅ GOOD: Scope pendingMocks() check
async function checkPendingMocks() {
  const scope1: Scope = nock('https://api.example.com').get('/a').reply(200);
  const scope2: Scope = nock('https://api.example.com').get('/b').reply(200);

  await fetch('https://api.example.com/a');
  await fetch('https://api.example.com/b');

  const pending = nock.pendingMocks();
  if (pending.length > 0) {
    throw new Error(`Pending mocks: ${pending.join(', ')}`);
  }

  return true;
}

// ❌ BAD: Scope created but not used
function scopeCreatedButNotUsed() {
  const scope: Scope = nock('https://api.example.com')
    .get('/unused')
    .reply(200, {});

  // Scope created but request never made
  // No verification
}

// ✅ GOOD: Chained scope methods
async function chainedScopeMethods() {
  const scope: Scope = nock('https://api.example.com')
    .get('/users')
    .matchHeader('authorization', /^Bearer /)
    .query({ limit: 10 })
    .reply(200, []);

  const response = await fetch('https://api.example.com/users?limit=10', {
    headers: { 'authorization': 'Bearer token123' }
  });

  if (!scope.isDone()) {
    throw new Error('Mock was not used');
  }

  return response.json();
}

// ❌ BAD: Chained scope without verification
async function chainedScopeWithoutVerification() {
  const scope: Scope = nock('https://api.example.com')
    .get('/data')
    .matchHeader('x-custom', 'value')
    .reply(200, {});

  const response = await fetch('https://api.example.com/data', {
    headers: { 'x-custom': 'value' }
  });

  // No scope.isDone() check
  return response.json();
}

// ✅ GOOD: Interceptor reply function
async function interceptorReplyFunction() {
  const scope: Scope = nock('https://api.example.com')
    .get('/dynamic')
    .reply(200, (uri, requestBody) => {
      return { uri, timestamp: Date.now() };
    });

  const response = await fetch('https://api.example.com/dynamic');
  const data = await response.json();

  if (!scope.isDone()) {
    throw new Error('Mock was not used');
  }

  return data;
}

// ❌ BAD: Scope activeMocks() not checked
function activeMocksNotChecked() {
  nock('https://api.example.com').get('/a').reply(200);
  nock('https://api.example.com').get('/b').reply(200);
  nock('https://api.example.com').get('/c').reply(200);

  const active = nock.activeMocks();
  // active.length === 3 but not verified
}

// ✅ GOOD: Scope done() method
async function scopeDoneMethod() {
  const scope: Scope = nock('https://api.example.com')
    .get('/users')
    .reply(200, []);

  await fetch('https://api.example.com/users');

  scope.done(); // Throws if not done
  return true;
}

// ❌ BAD: Scope done() not called
async function scopeDoneNotCalled() {
  const scope: Scope = nock('https://api.example.com')
    .get('/users')
    .reply(200, []);

  // Request never made
  // scope.done() not called - would throw
}

// ✅ GOOD: Scope replyWithError
async function scopeReplyWithError() {
  const scope: Scope = nock('https://api.example.com')
    .get('/error')
    .replyWithError('Network error');

  try {
    await fetch('https://api.example.com/error');
  } catch (error) {
    // Expected error
  }

  if (!scope.isDone()) {
    throw new Error('Mock was not used');
  }

  return true;
}

// ❌ BAD: Scope times() not fully consumed
async function scopeTimesNotFullyConsumed() {
  const scope: Scope = nock('https://api.example.com')
    .get('/repeated')
    .times(3)
    .reply(200, {});

  // Only called once
  await fetch('https://api.example.com/repeated');

  // scope.isDone() would return false (needs 2 more calls)
}

// ✅ GOOD: Scope times() fully consumed
async function scopeTimesFullyConsumed() {
  const scope: Scope = nock('https://api.example.com')
    .get('/repeated')
    .times(3)
    .reply(200, {});

  await fetch('https://api.example.com/repeated');
  await fetch('https://api.example.com/repeated');
  await fetch('https://api.example.com/repeated');

  if (!scope.isDone()) {
    throw new Error('Mock was not used expected number of times');
  }

  return true;
}

// ❌ BAD: Scope optionally() not verified
async function scopeOptionallyNotVerified() {
  const scope: Scope = nock('https://api.example.com')
    .get('/optional')
    .optionally()
    .reply(200, {});

  // Request not made - this is OK with optionally()
  // But should still verify with isDone() or pendingMocks()
}

// ✅ GOOD: Scope with delay
async function scopeWithDelay() {
  const scope: Scope = nock('https://api.example.com')
    .get('/delayed')
    .delay(100)
    .reply(200, { data: 'delayed' });

  const response = await fetch('https://api.example.com/delayed');
  const data = await response.json();

  if (!scope.isDone()) {
    throw new Error('Mock was not used');
  }

  return data;
}

export {
  scopeInstanceWithIsDoneCheck,
  scopeInstanceWithoutIsDoneCheck,
  multipleScopeInstances,
  scopeWithPersistNoCleanup,
  checkPendingMocks,
  scopeCreatedButNotUsed,
  chainedScopeMethods,
  chainedScopeWithoutVerification,
  interceptorReplyFunction,
  activeMocksNotChecked,
  scopeDoneMethod,
  scopeDoneNotCalled,
  scopeReplyWithError,
  scopeTimesNotFullyConsumed,
  scopeTimesFullyConsumed,
  scopeOptionallyNotVerified,
  scopeWithDelay
};
