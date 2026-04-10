/**
 * Demonstrates MISSING error handling for got.
 * Should trigger ERROR violations.
 */
import got from 'got';
import { createWriteStream } from 'fs';

// --- Promise API: missing try-catch ---

async function fetchDataNoErrorHandling() {
  // ❌ No try-catch - should trigger violation
  const response = await got('https://api.example.com/data');
  return JSON.parse(response.body);
}

async function fetchWithGetNoErrorHandling() {
  // ❌ No try-catch - should trigger violation
  const response = await got.get('https://api.example.com/users');
  return JSON.parse(response.body);
}

async function postDataNoErrorHandling() {
  // ❌ No try-catch - should trigger violation
  const response = await got.post('https://api.example.com/users', {
    json: { name: 'John' }
  });
  return JSON.parse(response.body);
}

async function putDataNoErrorHandling() {
  // ❌ No try-catch - should trigger violation
  const response = await got.put('https://api.example.com/users/123', {
    json: { name: 'Jane' }
  });
  return JSON.parse(response.body);
}

async function deleteDataNoErrorHandling() {
  // ❌ No try-catch - should trigger violation
  const response = await got.delete('https://api.example.com/users/123');
  return response.statusCode;
}

async function patchDataNoErrorHandling() {
  // ❌ No try-catch - should trigger violation
  const response = await got.patch('https://api.example.com/users/123', {
    json: { status: 'active' }
  });
  return JSON.parse(response.body);
}

async function headRequestNoErrorHandling() {
  // ❌ No try-catch - should trigger violation
  const response = await got.head('https://api.example.com/resource');
  return response.headers;
}

// Promise without catch
function fetchNoPromiseCatch() {
  // ❌ No .catch() - should trigger violation
  return got('https://api.example.com/data')
    .then(response => JSON.parse(response.body));
}

// --- Stream API: missing error listener ---

function streamToFileNoErrorHandler(destination: string) {
  // ❌ No 'error' event listener - unhandled stream error will crash the process
  const stream = got.stream('https://api.example.com/large-file');
  stream.pipe(createWriteStream(destination));
}

function streamGetNoErrorHandler(destination: string) {
  // ❌ No 'error' event listener on got.stream.get()
  const stream = got.stream.get('https://api.example.com/large-file');
  stream.pipe(createWriteStream(destination));
}

// --- got.paginate() without try-catch ---

async function paginateNoErrorHandling() {
  // ❌ No try-catch around for-await - should trigger violation
  const results: unknown[] = [];
  for await (const item of got.paginate('https://api.example.com/items')) {
    results.push(item);
  }
  return results;
}

async function paginateAllNoErrorHandling() {
  // ❌ No try-catch - should trigger violation
  return await got.paginate.all('https://api.example.com/items');
}

export {
  fetchDataNoErrorHandling,
  fetchWithGetNoErrorHandling,
  postDataNoErrorHandling,
  putDataNoErrorHandling,
  deleteDataNoErrorHandling,
  patchDataNoErrorHandling,
  headRequestNoErrorHandling,
  fetchNoPromiseCatch,
  streamToFileNoErrorHandler,
  streamGetNoErrorHandler,
  paginateNoErrorHandling,
  paginateAllNoErrorHandling,
};
