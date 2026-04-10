/**
 * Demonstrates PROPER error handling for undici.
 * Should NOT trigger violations.
 */
import { request, fetch } from 'undici';

async function fetchDataWithRequestWithTryCatch() {
  try {
    const { statusCode, headers, body } = await request('https://api.example.com/data');
    let data = '';
    for await (const chunk of body) {
      data += chunk;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}

async function fetchDataWithFetchWithTryCatch() {
  try {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch failed:', error);
    throw error;
  }
}

async function postDataWithFetchWithTryCatch() {
  try {
    const response = await fetch('https://api.example.com/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'John', email: 'john@example.com' })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('POST failed:', error);
    throw error;
  }
}

async function putDataWithRequestWithTryCatch() {
  try {
    const { statusCode, body } = await request('https://api.example.com/users/123', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Jane' })
    });
    let data = '';
    for await (const chunk of body) {
      data += chunk;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('PUT failed:', error);
    throw error;
  }
}

// Using promise .catch()
function fetchWithPromiseCatch() {
  return fetch('https://api.example.com/data')
    .then(response => response.json())
    .catch(error => {
      console.error('Fetch failed:', error);
      throw error;
    });
}
