/**
 * SuperAgent - Missing Error Handling Examples
 *
 * This file demonstrates INCORRECT error handling patterns for SuperAgent.
 * Should trigger ERROR violations.
 */

import request from 'superagent';

/**
 * ❌ Pattern 1: GET request without error handling
 * Should trigger ERROR violation
 */
async function fetchDataNoErrorHandling() {
  const res = await request.get('https://api.example.com/users');
  return res.body;
}

/**
 * ❌ Pattern 2: POST request without error handling
 * Should trigger ERROR violation
 */
async function createUserNoErrorHandling(userData: any) {
  const res = await request
    .post('https://api.example.com/users')
    .send(userData);
  return res.body;
}

/**
 * ❌ Pattern 3: PUT request without error handling
 * Should trigger ERROR violation
 */
async function updateUserNoErrorHandling(userId: string, updates: any) {
  const res = await request
    .put(`https://api.example.com/users/${userId}`)
    .send(updates);
  return res.body;
}

/**
 * ❌ Pattern 4: PATCH request without error handling
 * Should trigger ERROR violation
 */
async function patchUserNoErrorHandling(userId: string, patch: any) {
  const res = await request
    .patch(`https://api.example.com/users/${userId}`)
    .send(patch);
  return res.body;
}

/**
 * ❌ Pattern 5: DELETE request without error handling
 * Should trigger ERROR violation
 */
async function deleteUserNoErrorHandling(userId: string) {
  const res = await request
    .delete(`https://api.example.com/users/${userId}`);
  return res.status === 204;
}

/**
 * ❌ Pattern 6: Legacy .del() without error handling
 * Should trigger ERROR violation (using callback but not checking err)
 */
function deleteUserLegacyNoCheck(userId: string) {
  request
    .del(`https://api.example.com/users/${userId}`)
    .end((err, res) => {
      // No error checking - just using response
      console.log('User deleted:', res);
    });
}

/**
 * ❌ Pattern 7: HEAD request without error handling
 * Should trigger ERROR violation
 */
async function checkResourceNoErrorHandling(url: string) {
  const res = await request.head(url);
  return res.status === 200;
}

/**
 * ❌ Pattern 8: Promise without .catch()
 * Should trigger ERROR violation
 */
function fetchWithPromiseNoCatch() {
  request
    .get('https://api.example.com/users')
    .then(res => {
      console.log('Users:', res.body);
    });
  // Missing .catch()
}

/**
 * ❌ Pattern 9: Chained methods without error handling
 * Should trigger ERROR violation
 */
async function searchNoCatch(query: string) {
  const res = await request
    .get('https://api.example.com/search')
    .query({ q: query, limit: 10 })
    .set('Authorization', 'Bearer token123')
    .timeout(5000);
  return res.body;
}

/**
 * ❌ Pattern 10: .end() without callback
 * Should trigger ERROR violation
 */
function fetchWithEndNoCallback() {
  request.get('https://api.example.com/users').end();
}

/**
 * ❌ Pattern 11: Multiple requests without error handling
 * Should trigger multiple ERROR violations
 */
async function fetchMultipleNoErrorHandling() {
  const users = await request.get('https://api.example.com/users');
  const posts = await request.get('https://api.example.com/posts');
  const comments = await request.get('https://api.example.com/comments');

  return {
    users: users.body,
    posts: posts.body,
    comments: comments.body
  };
}

/**
 * ❌ Pattern 12: Request in a loop without error handling
 * Should trigger ERROR violation
 */
async function fetchInLoopNoErrorHandling(ids: string[]) {
  const results = [];
  for (const id of ids) {
    const res = await request.get(`https://api.example.com/items/${id}`);
    results.push(res.body);
  }
  return results;
}

/**
 * ❌ Pattern 13: Class method without error handling
 * Should trigger ERROR violations
 */
class BadApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get(path: string) {
    const res = await request.get(`${this.baseUrl}${path}`);
    return res.body;
  }

  async post(path: string, data: any) {
    const res = await request
      .post(`${this.baseUrl}${path}`)
      .send(data);
    return res.body;
  }
}

/**
 * ❌ Pattern 14: Retry without error handling
 * Should trigger ERROR violation
 */
async function fetchWithRetryNoCatch() {
  const res = await request
    .get('https://api.example.com/flaky')
    .retry(3);
  return res.body;
}

/**
 * ❌ Pattern 15: Fire and forget (no await or .then())
 * Should trigger ERROR violation
 */
function fireAndForget() {
  request
    .post('https://api.example.com/log')
    .send({ event: 'click' });
  // No .then(), no await, no .end()
}

export {
  fetchDataNoErrorHandling,
  createUserNoErrorHandling,
  updateUserNoErrorHandling,
  patchUserNoErrorHandling,
  deleteUserNoErrorHandling,
  deleteUserLegacyNoCheck,
  checkResourceNoErrorHandling,
  fetchWithPromiseNoCatch,
  searchNoCatch,
  fetchWithEndNoCallback,
  fetchMultipleNoErrorHandling,
  fetchInLoopNoErrorHandling,
  BadApiClient,
  fetchWithRetryNoCatch,
  fireAndForget
};
