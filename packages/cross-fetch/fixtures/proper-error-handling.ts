/**
 * Demonstrates PROPER error handling for cross-fetch.
 * Should NOT trigger any violations.
 */
import fetch from 'cross-fetch';

/**
 * Correctly wraps fetch in try-catch to handle network errors (TypeError).
 * Also checks response.ok for HTTP errors.
 */
async function fetchDataWithProperErrorHandling(url: string): Promise<unknown> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      console.error('Network error:', error.message);
    }
    throw error;
  }
}

/**
 * Correctly wraps fetch with AbortController and try-catch.
 */
async function fetchWithTimeoutAndErrorHandling(url: string, timeoutMs = 5000): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Fetch failed:', error);
    throw error;
  }
}

/**
 * POST request with proper error handling.
 */
async function postWithErrorHandling(url: string, body: object): Promise<unknown> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`POST failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Request error:', error);
    throw error;
  }
}

export { fetchDataWithProperErrorHandling, fetchWithTimeoutAndErrorHandling, postWithErrorHandling };
