/**
 * googleapis Ground-Truth Fixture
 *
 * Each call site annotated with // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 *
 * Note: googleapis uses a 3-level call chain:
 *   google.youtube({...}) → youtube service → youtube.channels.list()
 * The scanner may have limited precision on deeply nested property chains.
 * Contract postcondition IDs: error-api-call
 */

import { google } from 'googleapis';
import { GaxiosError } from 'gaxios';

const auth = {} as any; // mock auth for fixture

// ─── 1. Basic API call — no try-catch ─────────────────────────────────────────

export async function listChannelsNoCatch() {
  const youtube = google.youtube({ version: 'v3', auth });
  // SHOULD_FIRE: error-api-call — googleapis call with no try-catch
  const response = await youtube.channels.list({ part: ['snippet'], mine: true });
  return response.data.items;
}

// ─── 2. API call with try-catch ───────────────────────────────────────────────

export async function listChannelsWithCatch() {
  const youtube = google.youtube({ version: 'v3', auth });
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch — error-api-call requirement satisfied
    const response = await youtube.channels.list({ part: ['snippet'], mine: true });
    return response.data.items;
  } catch (error) {
    if (error instanceof GaxiosError) {
      console.error('API error:', error.status);
    }
    throw error;
  }
}

// ─── 3. Drive API call — no try-catch ─────────────────────────────────────────

export async function listDriveNoCatch() {
  const drive = google.drive({ version: 'v3', auth });
  // SHOULD_FIRE: error-api-call — drive API call without error handling
  const response = await drive.files.list({ pageSize: 10 });
  return response.data.files;
}

// ─── 4. Drive API call with try-catch ────────────────────────────────────────

export async function listDriveWithCatch() {
  const drive = google.drive({ version: 'v3', auth });
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch
    const response = await drive.files.list({ pageSize: 10 });
    return response.data.files;
  } catch (error) {
    throw error;
  }
}
