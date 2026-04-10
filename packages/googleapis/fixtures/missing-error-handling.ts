/**
 * MISSING error handling for googleapis
 * API calls NOT wrapped in try-catch → violations expected.
 */

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// VIOLATION: youtube.channels.list() — no try-catch
export async function listChannelsNoTryCatch(auth: OAuth2Client) {
  const youtube = google.youtube({ version: 'v3', auth });

  // No try-catch — GaxiosError will propagate as unhandled rejection
  const response = await youtube.channels.list({
    part: ['snippet', 'statistics'],
    mine: true,
  });
  return response.data.items || [];
}

// VIOLATION: drive.files.list() — no try-catch
export async function listDriveFilesNoTryCatch(auth: OAuth2Client) {
  const drive = google.drive({ version: 'v3', auth });

  // No try-catch — will throw GaxiosError if auth expires or quota exceeded
  const response = await drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
  });
  return response.data.files || [];
}

// VIOLATION: gmail.users.messages.send() — no try-catch
export async function sendGmailNoTryCatch(auth: OAuth2Client, messageData: string) {
  const gmail = google.gmail({ version: 'v1', auth });

  // No try-catch — send can fail with auth/quota/network errors
  const response = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: messageData },
  });
  return response.data;
}

// VIOLATION: youtube.videos.insert() — no try-catch
export async function uploadVideoNoTryCatch(auth: OAuth2Client, videoStream: any) {
  const youtube = google.youtube({ version: 'v3', auth });

  // No try-catch — upload can fail with quota/auth/upload errors
  const response = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: { title: 'My Video', description: 'Description' },
      status: { privacyStatus: 'public' },
    },
    media: { mimeType: 'video/mp4', body: videoStream },
  });
  return response.data;
}
