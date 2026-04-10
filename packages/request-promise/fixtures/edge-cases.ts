/**
 * EDGE CASES for request-promise
 * 
 * Tests complex patterns and edge cases
 */

import rp from 'request-promise';

/**
 * ✅ GOOD: Error handled in calling function
 * The violation is at the call site, not in wrapperFunction
 */
function wrapperFunction() {
  return rp('http://api.example.com/data');
}

async function callerWithTryCatch() {
  try {
    const data = await wrapperFunction();
    return data;
  } catch (err: any) {
    console.error('Error:', err);
    throw err;
  }
}

/**
 * ❌ BAD: Error not handled at call site
 * Should trigger violation where wrapperWithoutCatch() is called
 */
function wrapperWithoutCatch() {
  return rp('http://api.example.com/data');
}

async function callerWithoutTryCatch() {
  const data = await wrapperWithoutCatch(); // ❌ No try-catch
  return data;
}

/**
 * ✅ GOOD: Conditional request with error handling
 */
async function conditionalWithTryCatch(useApi: boolean) {
  if (\!useApi) {
    return null;
  }

  try {
    const data = await rp('http://api.example.com/data');
    return data;
  } catch (err: any) {
    console.error('Error:', err);
    return null;
  }
}

/**
 * ❌ BAD: Conditional request without error handling
 * Should trigger violation
 */
async function conditionalWithoutTryCatch(useApi: boolean) {
  if (\!useApi) {
    return null;
  }

  const data = await rp('http://api.example.com/data'); // ❌ No try-catch
  return data;
}

/**
 * ✅ GOOD: Loop with error handling
 */
async function loopWithTryCatch(urls: string[]) {
  const results = [];
  for (const url of urls) {
    try {
      const data = await rp(url);
      results.push(data);
    } catch (err: any) {
      console.error('Error fetching', url, err);
      results.push(null);
    }
  }
  return results;
}

/**
 * ❌ BAD: Loop without error handling
 * Should trigger violations for each iteration
 */
async function loopWithoutTryCatch(urls: string[]) {
  const results = [];
  for (const url of urls) {
    const data = await rp(url); // ❌ No try-catch
    results.push(data);
  }
  return results;
}

/**
 * ✅ GOOD: Nested error handling
 */
async function nestedWithTryCatch() {
  try {
    const user = await rp('http://api.example.com/user');
    const userData = JSON.parse(user);

    try {
      const posts = await rp(`http://api.example.com/users/${userData.id}/posts`);
      return { user: userData, posts: JSON.parse(posts) };
    } catch (err: any) {
      // Inner error - posts failed
      console.error('Error fetching posts:', err);
      return { user: userData, posts: [] };
    }
  } catch (err: any) {
    // Outer error - user fetch failed
    console.error('Error fetching user:', err);
    return null;
  }
}

/**
 * ❌ BAD: Only outer try-catch
 * Inner request should also be wrapped
 */
async function partialErrorHandling() {
  try {
    const user = await rp('http://api.example.com/user');
    const userData = JSON.parse(user);

    // ❌ No try-catch for this request
    const posts = await rp(`http://api.example.com/users/${userData.id}/posts`);
    return { user: userData, posts: JSON.parse(posts) };
  } catch (err: any) {
    console.error('Error:', err);
    return null;
  }
}

/**
 * ✅ GOOD: Promise.allSettled (handles both success and failure)
 */
async function allSettledWithTryCatch(urls: string[]) {
  try {
    const results = await Promise.allSettled(
      urls.map(url => rp(url))
    );
    
    return results.map((result, i) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error('Error for', urls[i], result.reason);
        return null;
      }
    });
  } catch (err: any) {
    // Promise.allSettled shouldn't reject, but safe to wrap
    console.error('Unexpected error:', err);
    return [];
  }
}

/**
 * ❌ BAD: Using .then() but no .catch()
 */
function thenWithoutCatch() {
  return rp('http://api.example.com/data')
    .then(data => JSON.parse(data))
    .then(parsed => {
      console.log('Data:', parsed);
      return parsed;
    });
  // Missing .catch()\!
}

/**
 * ✅ GOOD: .then() with .catch()
 */
function thenWithCatch() {
  return rp('http://api.example.com/data')
    .then(data => JSON.parse(data))
    .then(parsed => {
      console.log('Data:', parsed);
      return parsed;
    })
    .catch(err => {
      console.error('Error:', err);
      return null;
    });
}

/**
 * ❌ BAD: Callback-style usage (not supported by request-promise)
 * Note: request-promise doesn't support callbacks, this would error
 */
function callbackStyle() {
  // This is wrong - request-promise only returns promises
  // @ts-ignore
  rp('http://api.example.com/data', (err: any, response: any) => {
    if (err) {
      console.error('Error:', err);
    } else {
      console.log('Data:', response);
    }
  });
}
