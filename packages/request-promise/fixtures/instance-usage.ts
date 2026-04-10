/**
 * INSTANCE USAGE for request-promise
 * 
 * Tests detection of custom instances created with .defaults()
 */

import rp from 'request-promise';

/**
 * ❌ BAD: Instance call without error handling
 * Should trigger violation: rp-003
 */
async function instanceCallNoTryCatch() {
  const apiClient = rp.defaults({
    baseUrl: 'http://api.example.com',
    json: true,
    headers: {
      'Authorization': 'Bearer token123'
    }
  });

  const users = await apiClient('/users');
  return users;
}

/**
 * ✅ GOOD: Instance call with error handling
 * Should NOT trigger violation
 */
async function instanceCallWithTryCatch() {
  const apiClient = rp.defaults({
    baseUrl: 'http://api.example.com',
    json: true
  });

  try {
    const users = await apiClient('/users');
    return users;
  } catch (err: any) {
    console.error('Error fetching users:', err);
    return [];
  }
}

/**
 * ❌ BAD: Multiple instance calls without error handling
 * Should trigger violations for each call
 */
class ApiService {
  private client: any;

  constructor(baseUrl: string) {
    this.client = rp.defaults({
      baseUrl,
      json: true
    });
  }

  async getUsers() {
    return await this.client('/users'); // ❌ No try-catch
  }

  async getUser(id: string) {
    return await this.client(`/users/${id}`); // ❌ No try-catch
  }

  async createUser(data: any) {
    return await this.client.post('/users', { body: data }); // ❌ No try-catch
  }
}

/**
 * ✅ GOOD: Class with proper error handling
 * Should NOT trigger violations
 */
class SafeApiService {
  private client: any;

  constructor(baseUrl: string) {
    this.client = rp.defaults({
      baseUrl,
      json: true
    });
  }

  async getUsers() {
    try {
      return await this.client('/users');
    } catch (err: any) {
      console.error('Error fetching users:', err);
      return [];
    }
  }

  async getUser(id: string) {
    try {
      return await this.client(`/users/${id}`);
    } catch (err: any) {
      if (err.statusCode === 404) {
        return null;
      }
      throw err;
    }
  }

  async createUser(data: any) {
    try {
      return await this.client.post('/users', { body: data });
    } catch (err: any) {
      console.error('Error creating user:', err);
      throw err;
    }
  }
}

/**
 * ❌ BAD: Instance with custom options, no error handling
 * Should trigger violation: rp-003
 */
async function customInstanceWithOptions() {
  const client = rp.defaults({
    baseUrl: 'http://api.example.com',
    json: true,
    timeout: 5000,
    headers: {
      'User-Agent': 'My App/1.0'
    }
  });

  const response = await client({
    uri: '/data',
    qs: { page: 1, limit: 10 }
  });

  return response;
}
