/**
 * Demonstrates MISSING error handling with axios-retry
 * Should trigger ERROR violations - no try-catch
 *
 * IMPORTANT: axios-retry does NOT prevent errors from throwing.
 * After retries are exhausted, axios will throw - try-catch is still required.
 */

import axios from 'axios';
import axiosRetry from 'axios-retry';

// Configure axios with retry logic
axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
});

/**
 * ❌ VIOLATION: No try-catch
 * After 3 failed retries, this will throw an unhandled error
 */
async function fetchDataMissingErrorHandling() {
  // ❌ No try-catch - axios will throw after retries exhausted
  const response = await axios.get('https://api.example.com/data');
  return response.data;
}

/**
 * ❌ VIOLATION: No try-catch on instance
 */
const client = axios.create({
  baseURL: 'https://api.example.com',
});

axiosRetry(client, {
  retries: 5,
  retryCondition: (error) => {
    return error.response?.status === 429 || error.response?.status >= 500;
  },
});

async function fetchUserMissingErrorHandling(userId: string) {
  // ❌ No try-catch - will throw after all retries fail
  const response = await client.get(`/users/${userId}`);
  return response.data;
}

/**
 * ❌ VIOLATION: onMaxRetryTimesExceeded doesn't prevent throw
 * Common misconception: thinking the callback handles the error
 */
axiosRetry(axios, {
  retries: 3,
  onMaxRetryTimesExceeded: (error, retryCount) => {
    console.log(`All ${retryCount} retries failed:`, error.message);
    // This callback doesn't prevent the error from being thrown!
  },
});

async function fetchWithCallbackButNoTryCatch() {
  // ❌ No try-catch - onMaxRetryTimesExceeded doesn't handle the error
  const response = await axios.get('https://api.example.com/data');
  return response.data;
}

export {
  fetchDataMissingErrorHandling,
  fetchUserMissingErrorHandling,
  fetchWithCallbackButNoTryCatch
};
