/**
 * Fixture: Instance Usage for got Package
 * 
 * This file tests detection of got usage via extended instances.
 * Tests analyzer's ability to track got.extend() and instance methods.
 */

import got from 'got';

/**
 * Example 1: Extended instance with proper error handling
 * Should NOT trigger violations
 */
async function extendedInstanceProper(): Promise<any> {
  const api = got.extend({
    prefixUrl: 'https://api.example.com',
    headers: {
      'User-Agent': 'MyApp/1.0'
    }
  });

  try {
    const data = await api.get('users').json();
    return data;
  } catch (error) {
    if (error instanceof got.HTTPError) {
      console.error(`HTTP error: ${error.response.statusCode}`);
    } else if (error instanceof got.RequestError) {
      console.error(`Network error: ${error.code}`);
    }
    throw error;
  }
}

/**
 * Example 2: Extended instance without error handling
 * Should trigger ERROR violation
 */
async function extendedInstanceMissing(): Promise<any> {
  const api = got.extend({
    prefixUrl: 'https://api.example.com',
    timeout: { request: 5000 }
  });

  // ❌ No try-catch - should trigger violation
  const data = await api.get('users').json();
  return data;
}

/**
 * Example 3: Nested extended instances with proper handling
 * Should NOT trigger violations
 */
async function nestedExtendedInstancesProper(): Promise<any> {
  const baseApi = got.extend({
    prefixUrl: 'https://api.example.com'
  });

  const authenticatedApi = baseApi.extend({
    headers: {
      'Authorization': 'Bearer token123'
    }
  });

  try {
    const users = await authenticatedApi.get('users').json();
    return users;
  } catch (error) {
    if (error instanceof got.HTTPError) {
      console.error('API error:', error.response.statusCode);
    } else if (error instanceof got.RequestError) {
      console.error('Network error:', error.code);
    }
    throw error;
  }
}

/**
 * Example 4: Nested extended instances without handling
 * Should trigger ERROR violation
 */
async function nestedExtendedInstancesMissing(): Promise<any> {
  const baseApi = got.extend({
    prefixUrl: 'https://api.example.com'
  });

  const authenticatedApi = baseApi.extend({
    headers: {
      'Authorization': 'Bearer token123'
    }
  });

  // ❌ No try-catch - should trigger violation
  const users = await authenticatedApi.get('users').json();
  return users;
}

/**
 * Example 5: Instance stored in class property with proper handling
 * Should NOT trigger violations
 */
class ApiClientProper {
  private client: typeof got;

  constructor(baseUrl: string, token: string) {
    this.client = got.extend({
      prefixUrl: baseUrl,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async getUsers(): Promise<any> {
    try {
      return await this.client.get('users').json();
    } catch (error) {
      if (error instanceof got.HTTPError) {
        console.error('HTTP error:', error.response.statusCode);
      } else if (error instanceof got.RequestError) {
        console.error('Network error:', error.code);
      }
      throw error;
    }
  }

  async createUser(data: any): Promise<void> {
    try {
      await this.client.post('users', { json: data });
    } catch (error) {
      if (error instanceof got.HTTPError) {
        console.error('Failed to create user:', error.response.statusCode);
      } else if (error instanceof got.RequestError) {
        console.error('Network error:', error.code);
      }
      throw error;
    }
  }
}

/**
 * Example 6: Instance stored in class property without handling
 * Should trigger ERROR violations
 */
class ApiClientMissing {
  private client: typeof got;

  constructor(baseUrl: string, token: string) {
    this.client = got.extend({
      prefixUrl: baseUrl,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async getUsers(): Promise<any> {
    // ❌ No try-catch - should trigger violation
    return await this.client.get('users').json();
  }

  async createUser(data: any): Promise<void> {
    // ❌ No try-catch - should trigger violation
    await this.client.post('users', { json: data });
  }

  async deleteUser(id: string): Promise<void> {
    // ❌ No try-catch - should trigger violation
    await this.client.delete(`users/${id}`);
  }
}

/**
 * Example 7: Multiple instances with mixed handling
 */
async function multipleInstancesMixed(): Promise<void> {
  const api1 = got.extend({ prefixUrl: 'https://api1.example.com' });
  const api2 = got.extend({ prefixUrl: 'https://api2.example.com' });

  // ✅ Proper handling
  try {
    await api1.get('data').json();
  } catch (error) {
    console.error('API1 error:', error);
  }

  // ❌ Missing handling - should trigger violation
  await api2.get('data').json();
}

/**
 * Example 8: Instance with POST method without handling
 * Should trigger ERROR violation
 */
async function instancePostMissing(): Promise<void> {
  const api = got.extend({
    prefixUrl: 'https://api.example.com',
    headers: { 'Content-Type': 'application/json' }
  });

  // ❌ No try-catch - should trigger violation
  await api.post('users', {
    json: { name: 'John', email: 'john@example.com' }
  });
}

/**
 * Example 9: Instance with streaming without error handler
 * Should trigger ERROR violation
 */
function instanceStreamMissing(destination: string): void {
  const api = got.extend({
    prefixUrl: 'https://api.example.com'
  });

  // ❌ No error handler - should trigger violation
  api.stream('large-file').pipe(require('fs').createWriteStream(destination));
}

/**
 * Example 10: Instance with all HTTP methods, all missing handlers
 * Should trigger multiple ERROR violations
 */
async function instanceAllMethodsMissing(): Promise<void> {
  const api = got.extend({ prefixUrl: 'https://api.example.com' });

  // ❌ All missing try-catch
  await api.get('resource');
  await api.post('resource', { json: {} });
  await api.put('resource', { json: {} });
  await api.patch('resource', { json: {} });
  await api.delete('resource');
  await api.head('resource');
}

export {
  extendedInstanceProper,
  extendedInstanceMissing,
  nestedExtendedInstancesProper,
  nestedExtendedInstancesMissing,
  ApiClientProper,
  ApiClientMissing,
  multipleInstancesMixed,
  instancePostMissing,
  instanceStreamMissing,
  instanceAllMethodsMissing
};
