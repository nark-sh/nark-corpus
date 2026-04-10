/**
 * MISSING ERROR HANDLING for request-promise
 * 
 * This file demonstrates INCORRECT usage patterns.
 * Should trigger ERROR violations when analyzed.
 */

import rp from 'request-promise';

/**
 * ❌ BAD: No try-catch around await
 * Should trigger violation: rp-001
 */
async function fetchWithoutTryCatch() {
  const html = await rp('http://example.com');
  console.log('Success:', html);
  return html;
}

/**
 * ❌ BAD: No .catch() on promise chain
 * Should trigger violation: rp-001
 */
function fetchWithoutCatch() {
  rp('http://example.com')
    .then(html => {
      console.log('Success:', html);
    });
  // Missing .catch() - unhandled rejection if request fails\!
}

/**
 * ❌ BAD: rp.get() without error handling
 * Should trigger violation: rp-002
 */
async function getWithoutTryCatch() {
  const data = await rp.get('http://api.example.com/users');
  return JSON.parse(data);
}

/**
 * ❌ BAD: rp.post() without error handling
 * Should trigger violation: rp-002
 */
async function postWithoutTryCatch(userData: any) {
  const response = await rp.post({
    uri: 'http://api.example.com/users',
    json: true,
    body: userData
  });
  return response;
}

/**
 * ❌ BAD: rp.put() without error handling
 * Should trigger violation: rp-002
 */
async function putWithoutTryCatch(id: string, updates: any) {
  const response = await rp.put({
    uri: `http://api.example.com/users/${id}`,
    json: true,
    body: updates
  });
  return response;
}

/**
 * ❌ BAD: rp.delete() without error handling
 * Should trigger violation: rp-002
 */
async function deleteWithoutTryCatch(id: string) {
  await rp.delete(`http://api.example.com/users/${id}`);
  console.log('Deleted user:', id);
}

/**
 * ❌ BAD: Custom instance without error handling
 * Should trigger violation: rp-003
 */
async function customInstanceWithoutTryCatch() {
  const client = rp.defaults({
    baseUrl: 'http://api.example.com',
    json: true
  });

  const users = await client('/users');
  return users;
}

/**
 * ❌ BAD: Transform without error handling
 * Should trigger violation: rp-001
 */
async function withTransformNoTryCatch() {
  const users = await rp({
    uri: 'http://api.example.com/users',
    transform: (body) => JSON.parse(body)
  });
  return users;
}

/**
 * ❌ BAD: Promise.all without error handling
 * Should trigger violations for each rp call
 */
async function fetchMultipleWithoutTryCatch() {
  const [users, posts, comments] = await Promise.all([
    rp('http://api.example.com/users'),
    rp('http://api.example.com/posts'),
    rp('http://api.example.com/comments')
  ]);
  return { users, posts, comments };
}

/**
 * ❌ BAD: Chained promises without .catch()
 * Should trigger violation: rp-001
 */
function chainedWithoutCatch() {
  return rp('http://api.example.com/data')
    .then(data => JSON.parse(data))
    .then(parsed => parsed.results);
  // No .catch() - unhandled rejection\!
}

/**
 * ❌ BAD: Using options object without error handling
 * Should trigger violation: rp-001
 */
async function withOptionsNoTryCatch() {
  const response = await rp({
    method: 'GET',
    uri: 'http://api.example.com/data',
    headers: {
      'User-Agent': 'My App'
    }
  });
  return response;
}

/**
 * ❌ BAD: Form data POST without error handling
 * Should trigger violation: rp-002
 */
async function formPostWithoutTryCatch() {
  const response = await rp.post({
    uri: 'http://api.example.com/upload',
    formData: {
      file: 'data.txt',
      content: 'Hello'
    }
  });
  return response;
}

/**
 * ❌ BAD: Returning promise without .catch()
 * Should trigger violation: rp-001
 */
function returnPromiseWithoutCatch() {
  return rp('http://api.example.com/data');
  // Caller must handle errors, but we should at least warn
}

/**
 * ❌ BAD: Fire-and-forget request (no await, no .catch())
 * Should trigger violation: rp-001
 */
function fireAndForget() {
  rp('http://api.example.com/track-event');
  // Completely ignoring the promise - worst case\!
}
