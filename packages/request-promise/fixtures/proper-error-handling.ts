/**
 * PROPER ERROR HANDLING for request-promise
 * 
 * This file demonstrates CORRECT usage patterns.
 * Should have 0 violations when analyzed.
 */

import rp from 'request-promise';

/**
 * ✅ GOOD: Using try-catch with async/await
 */
async function fetchWithTryCatch() {
  try {
    const html = await rp('http://example.com');
    console.log('Success:', html);
  } catch (err: any) {
    if (err.statusCode) {
      console.error('HTTP error:', err.statusCode);
    } else if (err.cause) {
      console.error('Network error:', err.cause);
    } else {
      console.error('Unknown error:', err);
    }
  }
}

/**
 * ✅ GOOD: Using .catch() with promise chain
 */
function fetchWithCatch() {
  rp('http://example.com')
    .then(html => {
      console.log('Success:', html);
    })
    .catch(err => {
      console.error('Error:', err);
    });
}

/**
 * ✅ GOOD: Using rp.get() with error handling
 */
async function getWithErrorHandling() {
  try {
    const data = await rp.get('http://api.example.com/users');
    return JSON.parse(data);
  } catch (err: any) {
    if (err.statusCode === 404) {
      return []; // Return empty array on 404
    }
    throw err; // Re-throw other errors
  }
}

/**
 * ✅ GOOD: Using rp.post() with error handling
 */
async function postWithErrorHandling(userData: any) {
  try {
    const response = await rp.post({
      uri: 'http://api.example.com/users',
      json: true,
      body: userData
    });
    return response;
  } catch (err: any) {
    if (err.statusCode === 400) {
      console.error('Validation error:', err.error);
    }
    throw err;
  }
}

/**
 * ✅ GOOD: Custom instance with error handling
 */
async function customInstanceWithTryCatch() {
  const client = rp.defaults({
    baseUrl: 'http://api.example.com',
    json: true
  });

  try {
    const users = await client('/users');
    return users;
  } catch (err: any) {
    console.error('Error fetching users:', err);
    return [];
  }
}

/**
 * ✅ GOOD: Using simple: false (disables StatusCodeError)
 * Note: With simple: false, you need to check response.statusCode manually
 */
async function withSimpleFalse() {
  try {
    const response = await rp({
      uri: 'http://api.example.com/data',
      simple: false,
      resolveWithFullResponse: true
    });

    if (response.statusCode === 200) {
      return response.body;
    } else {
      throw new Error(`Unexpected status: ${response.statusCode}`);
    }
  } catch (err: any) {
    // Only network errors here (RequestError), not StatusCodeError
    console.error('Network error:', err);
    throw err;
  }
}

/**
 * ✅ GOOD: Transform with error handling
 */
async function withTransform() {
  try {
    const users = await rp({
      uri: 'http://api.example.com/users',
      transform: (body) => {
        try {
          return JSON.parse(body);
        } catch (e) {
          throw new Error('Invalid JSON response');
        }
      }
    });
    return users;
  } catch (err: any) {
    if (err.message === 'Invalid JSON response') {
      console.error('Transform error:', err);
    }
    throw err;
  }
}

/**
 * ✅ GOOD: Promise.all with error handling
 */
async function fetchMultipleWithTryCatch() {
  try {
    const [users, posts, comments] = await Promise.all([
      rp('http://api.example.com/users'),
      rp('http://api.example.com/posts'),
      rp('http://api.example.com/comments')
    ]);
    return { users, posts, comments };
  } catch (err: any) {
    console.error('One or more requests failed:', err);
    throw err;
  }
}

/**
 * ✅ GOOD: Chained promise with .catch()
 */
function chainedWithCatch() {
  return rp('http://api.example.com/data')
    .then(data => JSON.parse(data))
    .then(parsed => parsed.results)
    .catch(err => {
      console.error('Error in chain:', err);
      return []; // Return default value
    });
}

/**
 * ✅ GOOD: Using .finally() for cleanup
 */
async function withFinally() {
  let isLoading = true;
  try {
    const data = await rp('http://api.example.com/data');
    return data;
  } catch (err: any) {
    console.error('Error:', err);
    throw err;
  } finally {
    isLoading = false;
  }
}
