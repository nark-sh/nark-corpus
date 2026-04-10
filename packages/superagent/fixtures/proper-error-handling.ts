/**
 * SuperAgent - Proper Error Handling Examples
 *
 * This file demonstrates CORRECT error handling patterns for SuperAgent.
 * Should NOT trigger any violations.
 */

import request from 'superagent';

/**
 * Pattern 1: Promise with .catch()
 * ✅ PROPER - Error handling via .catch()
 */
async function fetchDataWithCatch() {
  request
    .get('https://api.example.com/users')
    .then(res => {
      console.log('Users:', res.body);
      return res.body;
    })
    .catch(err => {
      console.error('Request failed:', err.status, err.message);
    });
}

/**
 * Pattern 2: Async/await with try-catch
 * ✅ PROPER - Error handling via try-catch
 */
async function fetchDataWithTryCatch() {
  try {
    const res = await request.get('https://api.example.com/users');
    console.log('Users:', res.body);
    return res.body;
  } catch (err) {
    console.error('Request failed:', err);
    throw err;
  }
}

/**
 * Pattern 3: POST with try-catch
 * ✅ PROPER - POST request with error handling
 */
async function createUserWithErrorHandling(userData: any) {
  try {
    const res = await request
      .post('https://api.example.com/users')
      .send(userData);
    return res.body;
  } catch (err: any) {
    if (err.status === 400) {
      console.error('Invalid user data:', err.response.body);
    } else if (err.status === 500) {
      console.error('Server error:', err.message);
    }
    throw err;
  }
}

/**
 * Pattern 4: Legacy .end() callback with error handling
 * ✅ PROPER - Callback with error parameter
 */
function fetchDataWithCallback() {
  request
    .get('https://api.example.com/users')
    .end((err, res) => {
      if (err) {
        console.error('Request failed:', err);
        return;
      }
      console.log('Users:', res.body);
    });
}

/**
 * Pattern 5: Chained methods with error handling
 * ✅ PROPER - Query params, headers, and error handling
 */
async function searchWithFilters(query: string) {
  try {
    const res = await request
      .get('https://api.example.com/search')
      .query({ q: query, limit: 10 })
      .set('Authorization', 'Bearer token123')
      .timeout(5000);
    return res.body;
  } catch (err: any) {
    if (err.timeout) {
      console.error('Request timed out');
    } else {
      console.error('Search failed:', err.message);
    }
    throw err;
  }
}

/**
 * Pattern 6: PUT request with error handling
 * ✅ PROPER - Update resource with try-catch
 */
async function updateUser(userId: string, updates: any) {
  try {
    const res = await request
      .put(`https://api.example.com/users/${userId}`)
      .send(updates);
    return res.body;
  } catch (err) {
    console.error('Update failed:', err);
    throw err;
  }
}

/**
 * Pattern 7: PATCH request with error handling
 * ✅ PROPER - Partial update with try-catch
 */
async function patchUser(userId: string, patch: any) {
  try {
    const res = await request
      .patch(`https://api.example.com/users/${userId}`)
      .send(patch);
    return res.body;
  } catch (err) {
    console.error('Patch failed:', err);
    throw err;
  }
}

/**
 * Pattern 8: DELETE request with error handling
 * ✅ PROPER - Modern .delete() method
 */
async function deleteUser(userId: string) {
  try {
    const res = await request
      .delete(`https://api.example.com/users/${userId}`);
    return res.status === 204;
  } catch (err) {
    console.error('Delete failed:', err);
    throw err;
  }
}

/**
 * Pattern 9: Legacy .del() with error handling
 * ✅ PROPER - IE-compatible delete with callback
 */
function deleteUserLegacy(userId: string) {
  request
    .del(`https://api.example.com/users/${userId}`)
    .end((err, res) => {
      if (err) {
        console.error('Delete failed:', err);
        return;
      }
      console.log('User deleted');
    });
}

/**
 * Pattern 10: HEAD request with error handling
 * ✅ PROPER - Check resource existence
 */
async function checkResourceExists(url: string) {
  try {
    const res = await request.head(url);
    return res.status === 200;
  } catch (err: any) {
    if (err.status === 404) {
      return false;
    }
    throw err;
  }
}

/**
 * Pattern 11: Retry with error handling
 * ✅ PROPER - Automatic retries with error handling
 */
async function fetchWithRetry() {
  try {
    const res = await request
      .get('https://api.example.com/flaky')
      .retry(3);
    return res.body;
  } catch (err) {
    console.error('Failed after 3 retries:', err);
    throw err;
  }
}

/**
 * Pattern 12: Event-based error handling
 * ✅ PROPER - Using .on('error') event
 */
function fetchWithEventHandler() {
  request
    .get('https://api.example.com/data')
    .on('error', (err) => {
      console.error('Error event:', err);
    })
    .end((err, res) => {
      if (err) return;
      console.log('Data:', res.body);
    });
}

/**
 * Pattern 13: API Client Class with error handling
 * ✅ PROPER - Encapsulated client with consistent error handling
 */
class ApiClient {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async get(path: string) {
    try {
      const res = await request
        .get(`${this.baseUrl}${path}`)
        .set('Authorization', `Bearer ${this.token}`);
      return res.body;
    } catch (err) {
      console.error('GET failed:', err);
      throw err;
    }
  }

  async post(path: string, data: any) {
    try {
      const res = await request
        .post(`${this.baseUrl}${path}`)
        .set('Authorization', `Bearer ${this.token}`)
        .send(data);
      return res.body;
    } catch (err) {
      console.error('POST failed:', err);
      throw err;
    }
  }
}

export {
  fetchDataWithCatch,
  fetchDataWithTryCatch,
  createUserWithErrorHandling,
  fetchDataWithCallback,
  searchWithFilters,
  updateUser,
  patchUser,
  deleteUser,
  deleteUserLegacy,
  checkResourceExists,
  fetchWithRetry,
  fetchWithEventHandler,
  ApiClient
};
