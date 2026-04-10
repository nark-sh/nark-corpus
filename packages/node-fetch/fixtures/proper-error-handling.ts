/**
 * Proper error handling examples for node-fetch
 * These should NOT trigger violations
 */

import fetch from 'node-fetch';

/**
 * Proper: Basic try-catch for network errors
 * Should NOT trigger violation
 */
async function fetchWithProperErrorHandling() {
  try {
    const response = await fetch('https://api.example.com/data');

    // Also handle HTTP errors (fetch doesn't reject on 4xx/5xx)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Handles both network errors and HTTP errors
    console.error('Fetch failed:', error);
    throw error;
  }
}

/**
 * Proper: Handling with specific error type checking
 * Should NOT trigger violation
 */
async function fetchWithDetailedErrorHandling() {
  try {
    const response = await fetch('https://api.example.com/users/123');

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    // Check for specific error types
    if (error.type === 'system') {
      console.error('Network error:', error.code, error.message);
    } else if (error.name === 'AbortError') {
      console.error('Request was aborted');
    } else {
      console.error('Other error:', error.message);
    }
    throw error;
  }
}

/**
 * Proper: POST request with error handling
 * Should NOT trigger violation
 */
async function postDataWithErrorHandling(data: any) {
  try {
    const response = await fetch('https://api.example.com/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to create user: ${response.status} - ${errorBody}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to post data:', error);
    return null;
  }
}

/**
 * Proper: Multiple fetch calls with error handling
 * Should NOT trigger violation
 */
async function fetchMultipleEndpoints() {
  try {
    const [usersResponse, postsResponse] = await Promise.all([
      fetch('https://api.example.com/users'),
      fetch('https://api.example.com/posts'),
    ]);

    if (!usersResponse.ok || !postsResponse.ok) {
      throw new Error('One or more requests failed');
    }

    const users = await usersResponse.json();
    const posts = await postsResponse.json();

    return { users, posts };
  } catch (error) {
    console.error('Failed to fetch multiple endpoints:', error);
    throw error;
  }
}

/**
 * Proper: Using .then().catch() instead of try-catch
 * Should NOT trigger violation
 */
function fetchWithPromiseChain() {
  return fetch('https://api.example.com/data')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch(error => {
      console.error('Fetch error:', error);
      throw error;
    });
}

/**
 * Proper: Wrapper function with consistent error handling
 * Should NOT trigger violation
 */
async function safeFetch(url: string, options?: any) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    // Log and re-throw
    console.error(`Failed to fetch ${url}:`, error.message);
    throw error;
  }
}

// Usage examples (all wrapped in error handling)
async function runExamples() {
  try {
    await fetchWithProperErrorHandling();
    await fetchWithDetailedErrorHandling();
    await postDataWithErrorHandling({ name: 'Test User' });
    await fetchMultipleEndpoints();
    await fetchWithPromiseChain();
    await safeFetch('https://api.example.com/test');
  } catch (error) {
    console.error('Example failed:', error);
  }
}
