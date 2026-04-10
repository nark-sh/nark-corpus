/**
 * Demonstrates MISSING error handling for cross-fetch.
 * Should trigger ERROR violations.
 */
import fetch from 'cross-fetch';

/**
 * ❌ Missing try-catch — fetch can throw TypeError on network failure.
 * If DNS fails, connection is refused, or network is unavailable, this crashes.
 */
async function fetchDataWithoutErrorHandling(url: string): Promise<unknown> {
  const response = await fetch(url);
  return await response.json();
}

/**
 * ❌ Only checks response.ok but does NOT wrap fetch() in try-catch.
 * HTTP errors are handled, but network errors are not.
 * This is the most common antipattern found in real-world repos.
 */
async function fetchWithStatusCheckOnly(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return await response.json();
}

/**
 * ❌ POST request without try-catch.
 */
async function postWithoutErrorHandling(url: string, data: object): Promise<unknown> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  return result;
}

export { fetchDataWithoutErrorHandling, fetchWithStatusCheckOnly, postWithoutErrorHandling };
