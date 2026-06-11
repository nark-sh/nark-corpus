/**
 * cross-fetch Ground-Truth Fixture
 *
 * Each call site annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Contract postcondition IDs: network-error, http-error-unchecked, abort-error,
 *   json-parse-error, json-body-consumed-twice, text-abort-mid-stream,
 *   text-body-consumed-twice, text-converted-missing-encoding-package,
 *   text-converted-body-consumed-twice
 *
 * Key rules:
 *   - await fetch() without try-catch → SHOULD_FIRE (network-error)
 *   - await fetch() inside try-catch → SHOULD_NOT_FIRE
 *   - response.text() without try-catch after body already read → SHOULD_FIRE (text-body-consumed-twice)
 *   - response.text() with response.clone() before reading → SHOULD_NOT_FIRE
 *   - (response as any).textConverted() without try-catch → SHOULD_FIRE (text-converted-missing-encoding-package)
 *   - (response as any).textConverted() inside try-catch → SHOULD_NOT_FIRE
 */

import fetch from 'cross-fetch';

// ─── 1. fetch() without try-catch ─────────────────────────────────────────────

export async function fetchWithoutCatch(url: string) {
  // SHOULD_FIRE: network-error — fetch() without try-catch, can throw TypeError on network failure
  const response = await fetch(url);
  return response.json();
}

// ─── 2. fetch() with status check but no try-catch ──────────────────────────

export async function fetchWithStatusCheckOnly(url: string) {
  // SHOULD_FIRE: network-error — checks response.ok but no try-catch for network TypeError
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
  if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
  return response.json();
}

// ─── 3. POST without try-catch ───────────────────────────────────────────────

export async function postWithoutCatch(url: string, body: object) {
  // SHOULD_FIRE: network-error — POST fetch() without try-catch
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return response.json();
}

// ─── 4. fetch() inside try-catch ──────────────────────────────────────────────

export async function fetchWithCatch(url: string) {
  try {
    // SHOULD_NOT_FIRE: fetch() inside try-catch — network errors handled
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return await response.json();
  } catch (error) {
    throw error;
  }
}

// ─── 5. fetch() with AbortController inside try-catch ─────────────────────────

export async function fetchWithAbortAndCatch(url: string) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 5000);
  try {
    // SHOULD_NOT_FIRE: fetch() with AbortController inside try-catch — both network and abort handled
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return await response.text();
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// ─── 6. response.text() called after body already consumed ─────────────────────
// @expect-violation: text-body-consumed-twice

export async function textBodyConsumedTwice(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    // First read consumes the body stream
    const rawText = await response.text();
    console.log('Raw response length:', rawText.length);
    // TODO(scanner): text-body-consumed-twice — calling text() again on the same response
    // after body is already disturbed will throw TypeError "body used already".
    // No scanner detection rule exists yet — queued in upgrade-concerns.json.
    const textAgain = await response.text();
    return textAgain;
  } catch (error) {
    throw error;
  }
}

// ─── 7. response.text() with clone() — correct pattern ────────────────────────
// @expect-clean

export async function textWithClone(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    // SHOULD_NOT_FIRE: clone response before reading to allow multiple reads
    const responseClone = response.clone();
    const rawText = await response.text();
    console.log('Raw response length:', rawText.length);
    // Second read on clone — safe
    const textFromClone = await responseClone.text();
    return textFromClone;
  } catch (error) {
    throw error;
  }
}

// ─── 8. textConverted() without try-catch — missing encoding package ───────────
// @expect-violation: text-converted-missing-encoding-package

export async function textConvertedWithoutCatch(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
  // SHOULD_FIRE: text-converted-missing-encoding-package — textConverted() without try-catch;
  // if optional 'encoding' package is not installed, throws Error at runtime.
  // TODO(scanner): text-converted-missing-encoding-package — no scanner detection rule yet.
  const text = await (response as any).textConverted();
  return text;
}

// ─── 9. textConverted() inside try-catch — correct pattern ────────────────────
// @expect-clean

export async function textConvertedWithCatch(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    // SHOULD_NOT_FIRE: textConverted() inside try-catch — encoding Error handled
    const text = await (response as any).textConverted();
    return text;
  } catch (error) {
    const err = error as Error;
    if (err.message && err.message.includes('encoding must be installed')) {
      throw new Error('Install the "encoding" package: npm install encoding');
    }
    throw error;
  }
}

// ─── 10. textConverted() after body already consumed ──────────────────────────
// @expect-violation: text-converted-body-consumed-twice

export async function textConvertedAfterBodyConsumed(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    // First read consumes the body stream
    const rawText = await response.text();
    console.log('Raw response length:', rawText.length);
    // SHOULD_FIRE: text-converted-body-consumed-twice — calling textConverted() on
    // an already-consumed body throws TypeError "body used already".
    // TODO(scanner): text-converted-body-consumed-twice — no scanner detection rule yet.
    const decoded = await (response as any).textConverted();
    return decoded;
  } catch (error) {
    throw error;
  }
}

// ─── 11. textConverted() with clone() — correct pattern ───────────────────────
// @expect-clean

export async function textConvertedWithClone(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    // SHOULD_NOT_FIRE: clone before reading body to support textConverted() call
    const responseClone = response.clone();
    const rawText = await response.text();
    console.log('Raw response length:', rawText.length);
    // Use textConverted() on the clone — body not yet consumed
    const decoded = await (responseClone as any).textConverted();
    return decoded;
  } catch (error) {
    const err = error as Error;
    if (err.message && err.message.includes('encoding must be installed')) {
      throw new Error('Install the "encoding" package: npm install encoding');
    }
    throw error;
  }
}
