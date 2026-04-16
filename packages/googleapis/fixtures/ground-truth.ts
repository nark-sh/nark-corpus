/**
 * googleapis Ground-Truth Fixture
 *
 * Each call site annotated with // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 *
 * Note: googleapis uses a 3-level call chain:
 *   google.youtube({...}) → youtube service → youtube.channels.list()
 * The scanner may have limited precision on deeply nested property chains.
 * Contract postcondition IDs:
 *   error-api-call (channels.list, videos.insert, files.list)
 *   gmail-messages-send-auth-error
 *   gmail-messages-send-quota-exceeded
 *   gmail-messages-list-auth-error
 *   gmail-messages-list-rate-limit
 *   drive-files-create-storage-quota-exceeded
 *   drive-files-create-insufficient-permissions
 *   drive-files-create-rate-limit
 *   calendar-events-insert-auth-error
 *   calendar-events-insert-quota-exceeded
 *   calendar-events-insert-calendar-not-found
 *   calendar-events-list-sync-token-invalid
 *   calendar-events-list-auth-error
 *   sheets-values-update-rate-limit
 *   sheets-values-update-not-found
 *   sheets-batch-update-atomic-failure
 */

import { google } from 'googleapis';
import { GaxiosError } from 'gaxios';

const auth = {} as any; // mock auth for fixture

// ─── YouTube: channels.list ───────────────────────────────────────────────────

export async function listChannelsNoCatch() {
  const youtube = google.youtube({ version: 'v3', auth });
  // SHOULD_FIRE: error-api-call — googleapis call with no try-catch
  const response = await youtube.channels.list({ part: ['snippet'], mine: true });
  return response.data.items;
}

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

// ─── Drive: files.list ───────────────────────────────────────────────────────

export async function listDriveNoCatch() {
  const drive = google.drive({ version: 'v3', auth });
  // SHOULD_FIRE: error-api-call — drive API call without error handling
  const response = await drive.files.list({ pageSize: 10 });
  return response.data.files;
}

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

// ─── Gmail: messages.send ────────────────────────────────────────────────────

export async function sendEmailNoCatch(to: string, subject: string, body: string) {
  const gmail = google.gmail({ version: 'v1', auth });
  const message = Buffer.from(
    `To: ${to}\nSubject: ${subject}\n\n${body}`
  ).toString('base64url');
  // SHOULD_FIRE: gmail-messages-send-auth-error — no try-catch, auth can fail
  // SHOULD_FIRE: gmail-messages-send-quota-exceeded — no try-catch, quota can be exceeded
  const response = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: message },
  });
  return response.data.id;
}

export async function sendEmailWithCatch(to: string, subject: string, body: string) {
  const gmail = google.gmail({ version: 'v1', auth });
  const message = Buffer.from(
    `To: ${to}\nSubject: ${subject}\n\n${body}`
  ).toString('base64url');
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch with specific error handling
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: message },
    });
    return response.data.id;
  } catch (error) {
    if (error instanceof GaxiosError) {
      if (error.status === 401) {
        throw new Error('Gmail auth token expired — re-authentication required');
      }
      if (error.status === 403) {
        throw new Error(`Gmail quota exceeded: ${error.message}`);
      }
    }
    throw error;
  }
}

// ─── Gmail: messages.list ────────────────────────────────────────────────────

export async function listEmailsNoCatch(query: string) {
  const gmail = google.gmail({ version: 'v1', auth });
  // SHOULD_FIRE: gmail-messages-list-auth-error — no try-catch, token can expire
  // SHOULD_FIRE: gmail-messages-list-rate-limit — no try-catch, rate limit possible
  const response = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults: 100,
  });
  return response.data.messages;
}

export async function listEmailsWithCatch(query: string) {
  const gmail = google.gmail({ version: 'v1', auth });
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 100,
    });
    return response.data.messages;
  } catch (error) {
    if (error instanceof GaxiosError && error.status === 401) {
      throw new Error('Gmail auth expired');
    }
    throw error;
  }
}

// ─── Drive: files.create ─────────────────────────────────────────────────────

export async function createDriveFileNoCatch(name: string, content: string) {
  const drive = google.drive({ version: 'v3', auth });
  // SHOULD_FIRE: drive-files-create-storage-quota-exceeded — quota can be full
  // SHOULD_FIRE: drive-files-create-insufficient-permissions — permissions can deny
  // SHOULD_FIRE: drive-files-create-rate-limit — rate limit possible in loops
  const response = await drive.files.create({
    requestBody: { name, mimeType: 'text/plain' },
    media: { mimeType: 'text/plain', body: content },
  });
  return response.data.id;
}

export async function createDriveFileWithCatch(name: string, content: string) {
  const drive = google.drive({ version: 'v3', auth });
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch with specific error handling
    const response = await drive.files.create({
      requestBody: { name, mimeType: 'text/plain' },
      media: { mimeType: 'text/plain', body: content },
    });
    return response.data.id;
  } catch (error) {
    if (error instanceof GaxiosError) {
      const reason = (error as any).response?.data?.error?.errors?.[0]?.reason;
      if (reason === 'storageQuotaExceeded') {
        throw new Error('User Drive storage is full');
      }
      if (reason === 'insufficientFilePermissions') {
        throw new Error('No write access to Drive folder');
      }
    }
    throw error;
  }
}

// ─── Calendar: events.insert ─────────────────────────────────────────────────

export async function createCalendarEventNoCatch(
  calendarId: string, summary: string, start: string, end: string
) {
  const calendar = google.calendar({ version: 'v3', auth });
  // SHOULD_FIRE: calendar-events-insert-auth-error — auth can expire
  // SHOULD_FIRE: calendar-events-insert-quota-exceeded — quota can be hit
  // SHOULD_FIRE: calendar-events-insert-calendar-not-found — calendar can be deleted
  const response = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary,
      start: { dateTime: start },
      end: { dateTime: end },
    },
  });
  return response.data.id;
}

export async function createCalendarEventWithCatch(
  calendarId: string, summary: string, start: string, end: string
) {
  const calendar = google.calendar({ version: 'v3', auth });
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch
    const response = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary,
        start: { dateTime: start },
        end: { dateTime: end },
      },
    });
    return response.data.id;
  } catch (error) {
    if (error instanceof GaxiosError) {
      if (error.status === 401) throw new Error('Calendar auth expired');
      if (error.status === 404) throw new Error('Calendar not found');
    }
    throw error;
  }
}

// ─── Calendar: events.list with sync token ───────────────────────────────────

export async function listCalendarEventsNoCatch(calendarId: string, syncToken?: string) {
  const calendar = google.calendar({ version: 'v3', auth });
  // SHOULD_FIRE: calendar-events-list-sync-token-invalid — sync token can expire (410)
  // SHOULD_FIRE: calendar-events-list-auth-error — auth token can expire
  const response = await calendar.events.list({
    calendarId,
    syncToken,
    maxResults: 250,
  });
  return { items: response.data.items, nextSyncToken: response.data.nextSyncToken };
}

export async function listCalendarEventsWithCatch(calendarId: string, syncToken?: string) {
  const calendar = google.calendar({ version: 'v3', auth });
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch with sync token handling
    const response = await calendar.events.list({
      calendarId,
      syncToken,
      maxResults: 250,
    });
    return { items: response.data.items, nextSyncToken: response.data.nextSyncToken };
  } catch (error) {
    if (error instanceof GaxiosError) {
      if (error.status === 410) {
        throw new Error('SYNC_TOKEN_INVALID');
      }
      if (error.status === 401) {
        throw new Error('Calendar auth expired');
      }
    }
    throw error;
  }
}

// ─── Sheets: values.update ───────────────────────────────────────────────────

export async function updateSheetValuesNoCatch(
  spreadsheetId: string, range: string, values: string[][]
) {
  const sheets = google.sheets({ version: 'v4', auth });
  // SHOULD_FIRE: sheets-values-update-rate-limit — rate limit can be hit
  // SHOULD_FIRE: sheets-values-update-not-found — spreadsheet can be deleted
  const response = await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: { values },
  });
  return response.data.updatedRows;
}

export async function updateSheetValuesWithCatch(
  spreadsheetId: string, range: string, values: string[][]
) {
  const sheets = google.sheets({ version: 'v4', auth });
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: { values },
    });
    return response.data.updatedRows;
  } catch (error) {
    if (error instanceof GaxiosError) {
      if (error.status === 429) throw new Error('Sheets rate limit — backoff and retry');
      if (error.status === 404) throw new Error('Spreadsheet not found');
    }
    throw error;
  }
}

// ─── Sheets: spreadsheets.batchUpdate ────────────────────────────────────────

export async function batchUpdateSheetNoCatch(spreadsheetId: string, requests: any[]) {
  const sheets = google.sheets({ version: 'v4', auth });
  // SHOULD_FIRE: sheets-batch-update-atomic-failure — any invalid sub-request fails entire batch
  const response = await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests },
  });
  return response.data.replies;
}

export async function batchUpdateSheetWithCatch(spreadsheetId: string, requests: any[]) {
  const sheets = google.sheets({ version: 'v4', auth });
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch
    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests },
    });
    return response.data.replies;
  } catch (error) {
    if (error instanceof GaxiosError && error.status === 400) {
      const msg = (error as any).response?.data?.error?.message ?? 'Invalid batch request';
      throw new Error(`Sheets batchUpdate failed: ${msg}`);
    }
    throw error;
  }
}
