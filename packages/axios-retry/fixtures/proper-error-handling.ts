/**
 * Demonstrates PROPER error handling with axios-retry
 * Should NOT trigger violations - has try-catch
 */

import axios from 'axios';
import axiosRetry from 'axios-retry';

// Configure axios with retry logic
axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
});

/**
 * Proper: axios request with try-catch
 * Even with retry logic, final errors must be handled
 */
async function fetchDataWithRetryAndErrorHandling() {
  try {
    const response = await axios.get('https://api.example.com/data');
    return response.data;
  } catch (error) {
    // After all 3 retries are exhausted, error is caught here
    console.error('Request failed after retries:', error);
    throw error;
  }
}

/**
 * Proper: Using instance with retry configuration and error handling
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

async function fetchUserWithRetry(userId: string) {
  try {
    const response = await client.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user after retries:', error);
    throw error;
  }
}

export { fetchDataWithRetryAndErrorHandling, fetchUserWithRetry };
