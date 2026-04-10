/**
 * Demonstrates MISSING error handling for undici.
 * Should trigger ERROR violations.
 */
import { request, fetch } from 'undici';

async function fetchDataWithRequestNoErrorHandling() {
  // ❌ No try-catch - should trigger violation
  const { statusCode, headers, body } = await request('https://api.example.com/data');
  let data = '';
  for await (const chunk of body) {
    data += chunk;
  }
  return JSON.parse(data);
}

async function fetchDataWithFetchNoErrorHandling() {
  // ❌ No try-catch - should trigger violation
  const response = await fetch('https://api.example.com/data');
  const data = await response.json();
  return data;
}

async function postDataWithFetchNoErrorHandling() {
  // ❌ No try-catch - should trigger violation
  const response = await fetch('https://api.example.com/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'John' })
  });
  const data = await response.json();
  return data;
}

async function putDataWithRequestNoErrorHandling() {
  // ❌ No try-catch - should trigger violation
  const { body } = await request('https://api.example.com/users/123', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Jane' })
  });
  let data = '';
  for await (const chunk of body) {
    data += chunk;
  }
  return JSON.parse(data);
}

async function deleteDataWithFetchNoErrorHandling() {
  // ❌ No try-catch - should trigger violation
  const response = await fetch('https://api.example.com/users/123', {
    method: 'DELETE'
  });
  return response.status;
}

// Promise without catch
function fetchNoPromiseCatch() {
  // ❌ No .catch() - should trigger violation
  return fetch('https://api.example.com/data')
    .then(response => response.json());
}

function requestNoPromiseCatch() {
  // ❌ No .catch() - should trigger violation
  return request('https://api.example.com/data')
    .then(({ body }) => body);
}
