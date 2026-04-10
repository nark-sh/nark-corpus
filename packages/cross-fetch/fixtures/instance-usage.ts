/**
 * Tests detection of cross-fetch usage via class instances and wrappers.
 * Should trigger violations where try-catch is missing.
 */
import fetch from 'cross-fetch';

class ApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * ❌ Missing try-catch — network errors crash this method.
   */
  async getResource(path: string): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }
    return data;
  }

  /**
   * ✅ Correct — wraps fetch in try-catch.
   */
  async createResource(path: string, body: object): Promise<unknown> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error(`Create failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Create resource error:', error);
      throw error;
    }
  }
}

export { ApiClient };
