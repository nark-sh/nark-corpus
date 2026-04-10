/**
 * Test fixture for Axios instance usage patterns
 *
 * Tests detection of axios usage via instances (axios.create(), AxiosInstance).
 * Should trigger violations where try-catch is missing.
 */

import axios, { AxiosInstance } from 'axios';

// Pattern 1: axios.create() stored in variable
const client: AxiosInstance = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 5000
});

/**
 * VIOLATION: No try-catch on instance method call
 * Should trigger ERROR violation
 */
export async function fetchDataWithInstance() {
  // ❌ No try-catch - should trigger violation
  const response = await client.get('/data');
  return response.data;
}

// Pattern 2: Instance in class
class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({ baseURL });
  }

  /**
   * VIOLATION: No error handling on instance call
   * Should trigger ERROR violation
   */
  async fetchData() {
    // ❌ No try-catch - should trigger violation
    const response = await this.client.get('/data');
    return response.data;
  }

  /**
   * CORRECT: Proper error handling on instance call
   * Should NOT trigger violation
   */
  async fetchDataWithErrorHandling() {
    // ✅ Has try-catch - should NOT trigger violation
    try {
      const response = await this.client.get('/data');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Request failed:', error.message);
      }
      throw error;
    }
  }

  /**
   * VIOLATION: Multiple instance calls without error handling
   * Should trigger multiple ERROR violations
   */
  async fetchMultiple() {
    // ❌ Multiple calls without try-catch
    const users = await this.client.get('/users');
    const posts = await this.client.get('/posts');
    return { users: users.data, posts: posts.data };
  }
}

// Pattern 3: Constructor injection
class UserService {
  constructor(private httpClient: AxiosInstance) {}

  /**
   * VIOLATION: No error handling with injected instance
   * Should trigger ERROR violation
   */
  async getUser(id: string) {
    // ❌ No try-catch - should trigger violation
    const response = await this.httpClient.get(`/users/${id}`);
    return response.data;
  }

  /**
   * CORRECT: Proper error handling with injected instance
   * Should NOT trigger violation
   */
  async getUserSafe(id: string) {
    try {
      const response = await this.httpClient.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return null; // User not found
        }
        console.error('Failed to fetch user:', error.message);
      }
      throw error;
    }
  }
}

// Pattern 4: Function returning instance
function createAuthClient(token: string): AxiosInstance {
  return axios.create({
    baseURL: 'https://api.example.com',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * VIOLATION: Using function-created instance without error handling
 * Should trigger ERROR violation
 */
export async function fetchWithAuthClient(token: string) {
  const authClient = createAuthClient(token);
  // ❌ No try-catch - should trigger violation
  const response = await authClient.get('/protected');
  return response.data;
}

// Pattern 5: Global instance
export const globalClient = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10000
});

/**
 * VIOLATION: Using global instance without error handling
 * Should trigger ERROR violation
 */
export async function fetchWithGlobalClient() {
  // ❌ No try-catch - should trigger violation
  const response = await globalClient.get('/data');
  return response.data;
}

/**
 * CORRECT: Using global instance with proper error handling
 * Should NOT trigger violation
 */
export async function fetchWithGlobalClientSafe() {
  try {
    const response = await globalClient.get('/data');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Request failed:', error.message);
    }
    throw error;
  }
}
