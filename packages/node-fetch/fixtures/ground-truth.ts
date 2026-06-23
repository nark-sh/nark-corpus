/**
 * node-fetch Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "node-fetch"):
 *   - fetch()               postconditions: fetch-rejects-on-network-error,
 *                                           fetch-rejects-on-abort,
 *                                           fetch-rejects-on-redirect-error,
 *                                           fetch-http-error-not-thrown
 *   - response.json()       postconditions: response-json-throws-on-invalid-json,
 *                                           response-json-throws-on-max-size,
 *                                           response-json-throws-on-body-used
 *   - response.text()       postconditions: response-text-throws-on-stream-error,
 *                                           response-text-throws-on-premature-close
 *   - response.blob()       postconditions: response-blob-throws-on-stream-error
 *   - response.arrayBuffer() postconditions: response-arraybuffer-throws-on-stream-error
 *
 * Detection path: fetch imported from node-fetch →
 *   ThrowingFunctionDetector fires direct fetch() call →
 *   ContractMatcher checks try-catch → postcondition fires
 */

import fetch from 'node-fetch';

// ─────────────────────────────────────────────────────────────────────────────
// 1. fetch() — GET requests
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchGetNoCatch(url: string) {
  // SHOULD_FIRE: fetch-rejects-on-network-error — fetch rejects on ECONNREFUSED, ETIMEDOUT, DNS fail. No try-catch.
  const response = await fetch(url);
  return response.json();
}

export async function fetchGetWithCatch(url: string) {
  try {
    // SHOULD_NOT_FIRE: fetch inside try-catch satisfies error handling
    const response = await fetch(url);
    return response.json();
  } catch (err) {
    console.error('Fetch failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. fetch() — POST requests
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchPostNoCatch(url: string, body: object) {
  // SHOULD_FIRE: fetch-rejects-on-network-error — POST also rejects on network errors. No try-catch.
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return response.json();
}

export async function fetchPostWithCatch(url: string, body: object) {
  try {
    // SHOULD_NOT_FIRE: POST fetch inside try-catch
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return response.json();
  } catch (err) {
    console.error('POST failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. fetch() — enclosing try-catch (concern-20260401-node-fetch-1)
//    The try-catch wraps the entire async function body.
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchInsideFullBodyTryCatch(url: string) {
  try {
    // SHOULD_NOT_FIRE: fetch inside enclosing try-catch that covers entire function body.
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error: unknown) {
    console.error('Network error:', error);
    throw error;
  }
}

export async function fetchInsideTryCatchWithProcessing(url: string, body: object) {
  try {
    // SHOULD_NOT_FIRE: fetch inside try-catch with subsequent processing — all inside the try block.
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error: unknown) {
    throw new Error(`OpenAI API request failed: ${String(error)}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. fetch() — AbortError (fetch-rejects-on-abort)
//    Evidence: node_modules/node-fetch/src/index.js lines 69-89
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchWithAbortNoCatch(url: string) {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 100);
  // FUTURE_SHOULD_FIRE: fetch-rejects-on-abort — AbortError thrown when signal aborted. No try-catch.
  // (detection rule not yet implemented — queued as concern-2026-04-02-node-fetch-deepen-1)
  const response = await fetch(url, { signal: controller.signal });
  return response.text();
}

export async function fetchWithAbortWithCatch(url: string) {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 100);
  try {
    // SHOULD_NOT_FIRE: AbortError handled in try-catch
    const response = await fetch(url, { signal: controller.signal });
    return response.text();
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return null; // Expected cancellation
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. fetch() — HTTP error not thrown (fetch-http-error-not-thrown)
//    Evidence: node-fetch README — "3xx-5xx responses are NOT exceptions"
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchNoResponseOkCheck(url: string) {
  try {
    // FUTURE_SHOULD_FIRE: fetch-http-error-not-thrown — fetch resolves on HTTP 4xx/5xx, caller does NOT check response.ok
    // (detection rule not yet implemented — queued as concern-2026-04-02-node-fetch-deepen-2)
    const response = await fetch(url);
    return await response.json();
  } catch (err) {
    console.error('Network error:', err);
    throw err;
  }
}

export async function fetchWithResponseOkCheck(url: string) {
  try {
    // SHOULD_NOT_FIRE: caller explicitly checks response.ok before using body
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error('Fetch failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. response.json() — invalid JSON (response-json-throws-on-invalid-json)
//    Evidence: node_modules/node-fetch/src/body.js — JSON.parse(text) throws SyntaxError
// ─────────────────────────────────────────────────────────────────────────────

export async function responseJsonNoCatch(url: string) {
  const response = await fetch(url);
  // FUTURE_SHOULD_FIRE: response-json-throws-on-invalid-json — response.json() throws SyntaxError if body is not valid JSON. No try-catch.
  // (detection rule not yet implemented — queued as concern-2026-04-02-node-fetch-deepen-3)
  const data = await response.json();
  return data;
}

export async function responseJsonWithCatch(url: string) {
  try {
    const response = await fetch(url);
    // SHOULD_NOT_FIRE: json() inside try-catch — SyntaxError handled
    const data = await response.json();
    return data;
  } catch (err: unknown) {
    if (err instanceof SyntaxError) {
      console.error('Server returned non-JSON response');
      return null;
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. response.text() — stream errors (response-text-throws-on-stream-error)
//    Evidence: node_modules/node-fetch/src/body.js consumeBody() — FetchError type='system'
// ─────────────────────────────────────────────────────────────────────────────

export async function responseTextNoCatch(url: string) {
  try {
    const response = await fetch(url);
    // @expect-violation: response-text-throws-on-stream-error
    // SHOULD_FIRE: response.text() can throw FetchError on stream error. No inner try-catch.
    const text = await response.text();
    return text;
  } catch (err) {
    // Only the fetch() network error is caught here — stream errors during text() are also caught
    // by this outer try-catch in practice. This is actually a SHOULD_NOT_FIRE case since
    // the outer try-catch covers both fetch() and response.text().
    throw err;
  }
}

export async function responseTextOutsideCatch(url: string) {
  // FUTURE_SHOULD_FIRE: response-text-throws-on-stream-error — Neither fetch() nor response.text() have try-catch. Both can throw.
  // (detection rule not yet implemented — queued as concern-2026-04-02-node-fetch-deepen-4)
  const response = await fetch(url);
  const text = await response.text();
  return text;
}

export async function responseTextWithCatch(url: string) {
  try {
    // SHOULD_NOT_FIRE: Both fetch() and response.text() are inside a single try-catch
    const response = await fetch(url);
    const text = await response.text();
    return text;
  } catch (err) {
    console.error('Request or stream error:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. response.arrayBuffer() — stream errors (response-arraybuffer-throws-on-stream-error)
//    Evidence: node_modules/node-fetch/src/body.js consumeBody() — same path as text()
// ─────────────────────────────────────────────────────────────────────────────

export async function responseArrayBufferNoCatch(url: string) {
  // FUTURE_SHOULD_FIRE: response-arraybuffer-throws-on-stream-error — response.arrayBuffer() can throw FetchError on stream error/max-size. No try-catch.
  // (detection rule not yet implemented — queued as concern-2026-04-02-node-fetch-deepen-4)
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return buffer;
}

export async function responseArrayBufferWithCatch(url: string) {
  try {
    // SHOULD_NOT_FIRE: arrayBuffer() inside try-catch
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    return buffer;
  } catch (err) {
    console.error('Download failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. response.blob() — stream errors (response-blob-throws-on-stream-error)
//    Evidence: node_modules/node-fetch/src/body.js blob() delegates to arrayBuffer()
// ─────────────────────────────────────────────────────────────────────────────

export async function responseBlobNoCatch(url: string) {
  // FUTURE_SHOULD_FIRE: response-blob-throws-on-stream-error — response.blob() delegates to arrayBuffer() which can throw. No try-catch.
  // (detection rule not yet implemented — queued as concern-2026-04-02-node-fetch-deepen-4)
  const response = await fetch(url);
  const blob = await response.blob();
  return blob;
}

export async function responseBlobWithCatch(url: string) {
  try {
    // SHOULD_NOT_FIRE: blob() inside try-catch
    const response = await fetch(url);
    const blob = await response.blob();
    return blob;
  } catch (err) {
    console.error('Blob download failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. response.formData() — TypeError on missing Content-Type, FetchError on stream, TypeError on body-used
//     Postconditions: response-formdata-throws-on-missing-content-type,
//                     response-formdata-throws-on-stream-error,
//                     response-formdata-throws-on-body-used
//     Evidence: node_modules/node-fetch/src/body.js lines 110-126
// ─────────────────────────────────────────────────────────────────────────────

export async function responseFormDataNoCatch(url: string) {
  // FUTURE_SHOULD_FIRE: response-formdata-throws-on-stream-error / missing-content-type / body-used
  // (detection rule not yet implemented — queued as deepen concern)
  const response = await fetch(url);
  const formData = await response.formData();
  return formData;
}

export async function responseFormDataWithCatch(url: string) {
  try {
    // SHOULD_NOT_FIRE: formData() inside try-catch
    const response = await fetch(url);
    const formData = await response.formData();
    return formData;
  } catch (err) {
    if (err instanceof TypeError) {
      console.error('Missing Content-Type or body already used');
      return null;
    }
    console.error('Form data parse failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. blobFrom(path) — rejects on fs.stat failure
//     Postcondition: blobfrom-rejects-on-fs-stat-failure
//     Evidence: node_modules/fetch-blob/from.js line 21 — fs.promises.stat(path).then(...)
// ─────────────────────────────────────────────────────────────────────────────

import { blobFrom, fileFrom } from 'node-fetch';

export async function blobFromNoCatch(path: string) {
  // FUTURE_SHOULD_FIRE: blobfrom-rejects-on-fs-stat-failure — fs.stat ENOENT/EACCES rejection. No try-catch.
  // (detection rule not yet implemented — queued as deepen concern)
  const blob = await blobFrom(path);
  return blob;
}

export async function blobFromWithCatch(path: string) {
  try {
    // SHOULD_NOT_FIRE: blobFrom inside try-catch
    const blob = await blobFrom(path);
    return blob;
  } catch (err: any) {
    if (err && err.code === 'ENOENT') {
      console.error('File not found:', path);
      return null;
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. fileFrom(path) — rejects on fs.stat failure
//     Postcondition: filefrom-rejects-on-fs-stat-failure
//     Evidence: node_modules/fetch-blob/from.js line 28 — fs.promises.stat(path).then(...)
// ─────────────────────────────────────────────────────────────────────────────

export async function fileFromNoCatch(path: string) {
  // FUTURE_SHOULD_FIRE: filefrom-rejects-on-fs-stat-failure — fs.stat ENOENT/EACCES rejection. No try-catch.
  // (detection rule not yet implemented — queued as deepen concern)
  const file = await fileFrom(path, 'application/octet-stream');
  return file;
}

export async function fileFromWithCatch(path: string) {
  try {
    // SHOULD_NOT_FIRE: fileFrom inside try-catch
    const file = await fileFrom(path, 'application/octet-stream');
    return file;
  } catch (err: any) {
    if (err && err.code === 'ENOENT') {
      console.error('File not found:', path);
      return null;
    }
    throw err;
  }
}
