/**
 * Missing error handling examples for node-fetch
 * These SHOULD trigger ERROR violations
 */

import fetch from 'node-fetch';

/**
 * VIOLATION: No try-catch around fetch call
 * Should trigger ERROR violation
 */
async function fetchWithoutErrorHandling() {
  // ❌ No try-catch - network errors will cause unhandled rejection
  const response = await fetch('https://api.example.com/data');
  const data = await response.json();
  return data;
}

/**
 * VIOLATION: No try-catch for POST request
 * Should trigger ERROR violation
 */
async function postWithoutErrorHandling(userData: any) {
  // ❌ No try-catch - network errors unhandled
  const response = await fetch('https://api.example.com/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  return await response.json();
}

/**
 * VIOLATION: Partial error handling - checks response.ok but no try-catch
 * Should trigger ERROR violation
 */
async function fetchWithOnlyHttpErrorHandling() {
  // ❌ Checks HTTP errors but no try-catch for network errors
  const response = await fetch('https://api.example.com/users/123');

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

/**
 * VIOLATION: Multiple fetch calls without error handling
 * Should trigger ERROR violations (multiple)
 */
async function fetchMultipleWithoutErrorHandling() {
  // ❌ No try-catch on either fetch call
  const usersResponse = await fetch('https://api.example.com/users');
  const postsResponse = await fetch('https://api.example.com/posts');

  const users = await usersResponse.json();
  const posts = await postsResponse.json();

  return { users, posts };
}

/**
 * VIOLATION: Promise.all without error handling
 * Should trigger ERROR violation
 */
async function parallelFetchWithoutErrorHandling() {
  // ❌ No try-catch around Promise.all
  const [response1, response2] = await Promise.all([
    fetch('https://api.example.com/endpoint1'),
    fetch('https://api.example.com/endpoint2'),
  ]);

  return {
    data1: await response1.json(),
    data2: await response2.json(),
  };
}

/**
 * VIOLATION: Fetch in loop without error handling
 * Should trigger ERROR violations (multiple)
 */
async function fetchInLoopWithoutErrorHandling(ids: number[]) {
  const results = [];

  for (const id of ids) {
    // ❌ No try-catch in loop
    const response = await fetch(`https://api.example.com/items/${id}`);
    const data = await response.json();
    results.push(data);
  }

  return results;
}

/**
 * VIOLATION: Chained fetch calls without error handling
 * Should trigger ERROR violations (multiple)
 */
async function chainedFetchWithoutErrorHandling() {
  // ❌ First fetch without try-catch
  const userResponse = await fetch('https://api.example.com/user/me');
  const user = await userResponse.json();

  // ❌ Second fetch without try-catch
  const postsResponse = await fetch(`https://api.example.com/users/${user.id}/posts`);
  const posts = await postsResponse.json();

  return { user, posts };
}

/**
 * VIOLATION: DELETE request without error handling
 * Should trigger ERROR violation
 */
async function deleteWithoutErrorHandling(id: number) {
  // ❌ No try-catch
  const response = await fetch(`https://api.example.com/items/${id}`, {
    method: 'DELETE',
  });

  return response.ok;
}

/**
 * VIOLATION: PUT request without error handling
 * Should trigger ERROR violation
 */
async function updateWithoutErrorHandling(id: number, data: any) {
  // ❌ No try-catch
  const response = await fetch(`https://api.example.com/items/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return await response.json();
}

/**
 * VIOLATION: Fetch with custom headers but no error handling
 * Should trigger ERROR violation
 */
async function fetchWithHeadersNoErrorHandling(token: string) {
  // ❌ No try-catch
  const response = await fetch('https://api.example.com/protected', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  return await response.json();
}

// Usage that would cause unhandled rejections
async function runViolations() {
  // All of these will crash if network fails
  await fetchWithoutErrorHandling();
  await postWithoutErrorHandling({ name: 'Test' });
  await fetchWithOnlyHttpErrorHandling();
  await fetchMultipleWithoutErrorHandling();
  await parallelFetchWithoutErrorHandling();
  await fetchInLoopWithoutErrorHandling([1, 2, 3]);
  await chainedFetchWithoutErrorHandling();
  await deleteWithoutErrorHandling(1);
  await updateWithoutErrorHandling(1, { status: 'updated' });
  await fetchWithHeadersNoErrorHandling('token123');
}
