/**
 * cross-fetch Ground-Truth Fixture
 *
 * Each call site annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Contract postcondition IDs: network-error
 *
 * Key rules:
 *   - await fetch() without try-catch → SHOULD_FIRE
 *   - await fetch() inside try-catch → SHOULD_NOT_FIRE
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
