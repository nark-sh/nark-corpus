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
 *   drive-permissions-create-sharing-rate-limit
 *   drive-permissions-create-insufficient-permissions
 *   drive-permissions-create-invalid-sharing-request
 *   gmail-watch-pubsub-permission-missing
 *   gmail-watch-expiry-not-renewed (silent — no error thrown on expiry)
 *   drive-files-delete-no-try-catch
 *   drive-files-delete-folder-cascade
 *   drive-files-export-no-try-catch
 *   calendar-events-delete-no-try-catch
 *   sheets-values-append-no-try-catch
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
  // SHOULD_FIRE: gmail-messages-send-auth-error — no try-catch, auth or quota errors unhandled
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
  // SHOULD_FIRE: error-api-call — no try-catch, token or rate limit errors unhandled
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
  // SHOULD_FIRE: drive-files-create-storage-quota-exceeded — quota, permissions, or rate limit unhandled
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
  // SHOULD_FIRE: calendar-events-insert-auth-error — auth, quota, or not-found unhandled
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
  // SHOULD_FIRE: calendar-events-list-sync-token-invalid — sync token or auth token unhandled
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
  // SHOULD_FIRE: sheets-values-update-not-found — rate limit or not-found unhandled
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

// ─── Drive: permissions.create ───────────────────────────────────────────────

export async function sharePermissionNoCatch(
  fileId: string, emailAddress: string
) {
  const drive = google.drive({ version: 'v3', auth });
  // SHOULD_FIRE: drive-permissions-create-sharing-rate-limit
  const response = await drive.permissions.create({
    fileId,
    requestBody: { type: 'user', role: 'reader', emailAddress },
    sendNotificationEmail: true,
  });
  return response.data.id;
}

export async function bulkSharePermissionNoCatch(
  fileId: string, emails: string[]
) {
  const drive = google.drive({ version: 'v3', auth });
  const ids: string[] = [];
  for (const emailAddress of emails) {
    // SHOULD_FIRE: drive-permissions-create-insufficient-permissions
    const response = await drive.permissions.create({
      fileId,
      requestBody: { type: 'user', role: 'writer', emailAddress },
    });
    if (response.data.id) ids.push(response.data.id);
  }
  return ids;
}

export async function shareWithDomainNoCatch(
  fileId: string, domain: string
) {
  const drive = google.drive({ version: 'v3', auth });
  // SHOULD_FIRE: drive-permissions-create-invalid-sharing-request
  const response = await drive.permissions.create({
    fileId,
    requestBody: { type: 'domain', role: 'reader', domain },
  });
  return response.data.id;
}

export async function sharePermissionWithCatch(
  fileId: string, emailAddress: string
) {
  const drive = google.drive({ version: 'v3', auth });
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch with specific reason handling
    const response = await drive.permissions.create({
      fileId,
      requestBody: { type: 'user', role: 'reader', emailAddress },
      sendNotificationEmail: false,
    });
    return response.data.id;
  } catch (error) {
    if (error instanceof GaxiosError) {
      const reason = (error as any).response?.data?.error?.errors?.[0]?.reason;
      if (reason === 'sharingRateLimitExceeded') {
        throw new Error('Drive sharing rate limit — back off');
      }
      if (reason === 'insufficientFilePermissions') {
        throw new Error('Caller lacks rights to grant access on this file');
      }
      if (reason === 'invalidSharingRequest') {
        const msg = (error as any).response?.data?.error?.message ?? 'Invalid share';
        throw new Error(`Drive share rejected: ${msg}`);
      }
    }
    throw error;
  }
}

// ─── Gmail: messages.watch (push notifications) ───────────────────────────────

export async function setupGmailWatchNoCatch(topicName: string) {
  const gmail = google.gmail({ version: 'v1', auth });
  // SHOULD_FIRE: gmail-watch-pubsub-permission-missing — Pub/Sub permission misconfiguration unhandled
  const response = await gmail.users.watch({
    userId: 'me',
    requestBody: {
      topicName,
      labelIds: ['INBOX'],
      labelFilterAction: 'include',
    },
  });
  return response.data;
}

export async function setupGmailWatchWithCatch(topicName: string) {
  const gmail = google.gmail({ version: 'v1', auth });
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch with Pub/Sub permission error handling
    const response = await gmail.users.watch({
      userId: 'me',
      requestBody: {
        topicName,
        labelIds: ['INBOX'],
        labelFilterAction: 'include',
      },
    });
    return response.data;
  } catch (error) {
    if (error instanceof GaxiosError) {
      if (error.status === 403) {
        const msg = (error as any).response?.data?.error?.message ?? '';
        if (msg.toLowerCase().includes('topic')) {
          throw new Error(`Gmail push setup failed — Pub/Sub topic permission missing: ${msg}`);
        }
        throw new Error(`Gmail watch setup forbidden: ${error.message}`);
      }
    }
    throw error;
  }
}

// ─── Drive: files.delete ─────────────────────────────────────────────────────

export async function deleteDriveFileNoCatch(fileId: string) {
  const drive = google.drive({ version: 'v3', auth });
  // SHOULD_FIRE: drive-files-delete-no-try-catch — permanent irreversible delete, no error handling
  await drive.files.delete({ fileId });
}

export async function deleteFolderNoCatch(folderId: string) {
  const drive = google.drive({ version: 'v3', auth });
  // SHOULD_FIRE: drive-files-delete-folder-cascade — all owned descendants permanently deleted
  await drive.files.delete({ fileId: folderId });
}

export async function deleteDriveFileWithCatch(fileId: string) {
  const drive = google.drive({ version: 'v3', auth });
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch with 404 idempotency handling
    await drive.files.delete({ fileId });
  } catch (error) {
    if (error instanceof GaxiosError) {
      if (error.status === 404) {
        return; // already deleted — treat as success for cleanup jobs
      }
      if (error.status === 403) {
        const reason = (error as any).response?.data?.error?.errors?.[0]?.reason;
        if (reason === 'insufficientFilePermissions') {
          throw new Error('Cannot delete: caller is not the file owner or Shared Drive organizer');
        }
      }
    }
    throw error;
  }
}

// ─── Drive: files.export ─────────────────────────────────────────────────────

export async function exportDriveFileNoCatch(fileId: string, mimeType: string) {
  const drive = google.drive({ version: 'v3', auth });
  // SHOULD_FIRE: drive-files-export-no-try-catch — 10 MB limit and format errors unhandled
  const response = await drive.files.export({ fileId, mimeType });
  return response.data;
}

export async function exportDriveFileWithCatch(fileId: string, mimeType: string) {
  const drive = google.drive({ version: 'v3', auth });
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch with format/size error handling
    const response = await drive.files.export({ fileId, mimeType });
    return response.data;
  } catch (error) {
    if (error instanceof GaxiosError) {
      if (error.status === 403) {
        const reason = (error as any).response?.data?.error?.errors?.[0]?.reason;
        if (reason === 'fileNotExportable') {
          throw new Error('File cannot be exported: exceeds 10 MB limit or unsupported MIME type');
        }
      }
      if (error.status === 404) {
        throw new Error('File not found for export');
      }
    }
    throw error;
  }
}

// ─── Calendar: events.delete ─────────────────────────────────────────────────

export async function deleteCalendarEventNoCatch(calendarId: string, eventId: string) {
  const calendar = google.calendar({ version: 'v3', auth });
  // SHOULD_FIRE: calendar-events-delete-no-try-catch — 404, 403 organizer restriction unhandled
  await calendar.events.delete({ calendarId, eventId });
}

export async function deleteCalendarEventWithCatch(calendarId: string, eventId: string) {
  const calendar = google.calendar({ version: 'v3', auth });
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch with idempotency and organizer handling
    await calendar.events.delete({ calendarId, eventId });
  } catch (error) {
    if (error instanceof GaxiosError) {
      if (error.status === 404) {
        return; // already deleted — treat as success for cleanup jobs
      }
      if (error.status === 403) {
        const reason = (error as any).response?.data?.error?.errors?.[0]?.reason;
        if (reason === 'forbiddenForNonOrganizer') {
          throw new Error('Only the event organizer can delete this shared event');
        }
        if (reason === 'rateLimitExceeded' || reason === 'userRateLimitExceeded') {
          throw new Error('Calendar API rate limit exceeded — use exponential backoff');
        }
      }
    }
    throw error;
  }
}

// ─── Sheets: values.append ───────────────────────────────────────────────────

export async function appendSheetRowsNoCatch(
  spreadsheetId: string, range: string, values: string[][]
) {
  const sheets = google.sheets({ version: 'v4', auth });
  // SHOULD_FIRE: sheets-values-append-no-try-catch — 429 rate limit, 403 permissions unhandled
  const response = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: { values },
  });
  return response.data.updates;
}

export async function appendSheetRowsWithCatch(
  spreadsheetId: string, range: string, values: string[][]
) {
  const sheets = google.sheets({ version: 'v4', auth });
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch with rate limit backoff handling
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: { values },
    });
    return response.data.updates;
  } catch (error) {
    if (error instanceof GaxiosError) {
      if (error.status === 429) {
        throw new Error('Sheets write quota exceeded (60 writes/user/min) — implement exponential backoff');
      }
      if (error.status === 403) {
        const reason = (error as any).response?.data?.error?.errors?.[0]?.reason;
        if (reason === 'insufficientFilePermissions') {
          throw new Error('Caller lacks editor access to the spreadsheet');
        }
      }
    }
    throw error;
  }
}
