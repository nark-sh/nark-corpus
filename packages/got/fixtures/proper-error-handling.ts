/**
 * Demonstrates PROPER error handling for got.
 * Should NOT trigger violations.
 */
import got, { HTTPError, RequestError, TimeoutError } from 'got';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

// --- Promise API: basic methods ---

async function fetchDataWithTryCatch() {
  try {
    const response = await got('https://api.example.com/data');
    return JSON.parse(response.body);
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}

async function fetchWithGetMethod() {
  try {
    const response = await got.get('https://api.example.com/users');
    return JSON.parse(response.body);
  } catch (error) {
    console.error('GET failed:', error);
    throw error;
  }
}

async function postDataWithTryCatch() {
  try {
    const response = await got.post('https://api.example.com/users', {
      json: { name: 'John', email: 'john@example.com' }
    });
    return JSON.parse(response.body);
  } catch (error) {
    console.error('POST failed:', error);
    throw error;
  }
}

async function putDataWithTryCatch() {
  try {
    const response = await got.put('https://api.example.com/users/123', {
      json: { name: 'Jane' }
    });
    return JSON.parse(response.body);
  } catch (error) {
    console.error('PUT failed:', error);
    throw error;
  }
}

async function deleteDataWithTryCatch() {
  try {
    const response = await got.delete('https://api.example.com/users/123');
    return response.statusCode;
  } catch (error) {
    console.error('DELETE failed:', error);
    throw error;
  }
}

async function patchDataWithTryCatch() {
  try {
    const response = await got.patch('https://api.example.com/users/123', {
      json: { status: 'active' }
    });
    return JSON.parse(response.body);
  } catch (error) {
    console.error('PATCH failed:', error);
    throw error;
  }
}

async function headRequestWithTryCatch() {
  try {
    const response = await got.head('https://api.example.com/resource');
    return response.headers;
  } catch (error) {
    console.error('HEAD failed:', error);
    throw error;
  }
}

// Using promise .catch()
function fetchWithPromiseCatch() {
  return got('https://api.example.com/data')
    .then(response => JSON.parse(response.body))
    .catch(error => {
      console.error('Request failed:', error);
      throw error;
    });
}

// --- Typed error handling (HTTPError vs RequestError) ---

async function fetchWithTypedErrorHandling() {
  try {
    const data = await got('https://api.example.com/data').json<{ id: number }>();
    return data;
  } catch (error) {
    if (error instanceof HTTPError) {
      // HTTP-level error (4xx, 5xx)
      console.error('HTTP error:', error.response.statusCode);
      if (error.response.statusCode === 404) {
        return null; // handle not-found gracefully
      }
      if (error.response.statusCode === 429) {
        throw new Error('Rate limited — back off and retry');
      }
    } else if (error instanceof TimeoutError) {
      console.error('Request timed out at phase:', error.event);
    } else if (error instanceof RequestError) {
      // Network-level error (ECONNREFUSED, ENOTFOUND, etc.)
      console.error('Network error:', error.code);
    }
    throw error;
  }
}

// --- throwHttpErrors: false — check status manually, no throw on 4xx/5xx ---

async function fetchWithoutThrowOnHttpErrors() {
  try {
    const response = await got('https://api.example.com/resource', {
      throwHttpErrors: false
    });
    if (response.statusCode >= 400) {
      console.error('Request failed with status:', response.statusCode);
      return null;
    }
    return JSON.parse(response.body);
  } catch (error) {
    // Only network errors (RequestError) reach here, not 4xx/5xx
    console.error('Network error:', error);
    throw error;
  }
}

// --- Stream API: must use 'error' event listener, NOT try-catch ---

function streamToFileWithErrorHandler(destination: string) {
  const stream = got.stream('https://api.example.com/large-file');

  // ✅ Correct: attach error listener to the got stream
  stream.on('error', (error) => {
    console.error('Stream error:', error.message);
  });

  stream.pipe(createWriteStream(destination));
}

async function streamWithPipelineAndErrorHandling(destination: string) {
  try {
    await pipeline(
      got.stream('https://api.example.com/large-file'),
      createWriteStream(destination)
    );
  } catch (error) {
    // pipeline() wraps stream errors into a rejected Promise
    console.error('Pipeline failed:', error);
    throw error;
  }
}

// --- got.paginate() — wrap for-await in try-catch ---

async function paginateWithTryCatch() {
  try {
    const results: unknown[] = [];
    for await (const item of got.paginate('https://api.example.com/items')) {
      results.push(item);
    }
    return results;
  } catch (error) {
    console.error('Pagination failed:', error);
    throw error;
  }
}

async function paginateAllWithTryCatch() {
  try {
    return await got.paginate.all('https://api.example.com/items');
  } catch (error) {
    console.error('Paginate all failed:', error);
    throw error;
  }
}

// --- got.extend() instances — same error handling required ---

async function extendedInstanceWithTryCatch() {
  const api = got.extend({
    prefixUrl: 'https://api.example.com',
    headers: { 'Authorization': 'Bearer token123' }
  });

  try {
    const data = await api.get('users').json();
    return data;
  } catch (error) {
    if (error instanceof HTTPError) {
      console.error('HTTP error:', error.response.statusCode);
    } else if (error instanceof RequestError) {
      console.error('Network error:', error.code);
    }
    throw error;
  }
}

export {
  fetchDataWithTryCatch,
  fetchWithGetMethod,
  postDataWithTryCatch,
  putDataWithTryCatch,
  deleteDataWithTryCatch,
  patchDataWithTryCatch,
  headRequestWithTryCatch,
  fetchWithPromiseCatch,
  fetchWithTypedErrorHandling,
  fetchWithoutThrowOnHttpErrors,
  streamToFileWithErrorHandler,
  streamWithPipelineAndErrorHandling,
  paginateWithTryCatch,
  paginateAllWithTryCatch,
  extendedInstanceWithTryCatch,
};
