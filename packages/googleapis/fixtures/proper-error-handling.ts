/**
 * PROPER error handling for googleapis
 * All API calls wrapped in try-catch → ZERO violations expected.
 */

import { google } from 'googleapis';
import { GaxiosError } from 'gaxios';
import { OAuth2Client } from 'google-auth-library';

// CORRECT: youtube.channels.list() inside try-catch
export async function listChannelsCorrect(auth: OAuth2Client) {
  const youtube = google.youtube({ version: 'v3', auth });

  try {
    const response = await youtube.channels.list({
      part: ['snippet', 'statistics'],
      mine: true,
    });
    return response.data.items || [];
  } catch (error) {
    if (error instanceof GaxiosError) {
      console.error('YouTube API error:', error.status, error.message);
    }
    throw error;
  }
}

// CORRECT: drive.files.list() inside try-catch
export async function listDriveFilesCorrect(auth: OAuth2Client) {
  const drive = google.drive({ version: 'v3', auth });

  try {
    const response = await drive.files.list({
      pageSize: 10,
      fields: 'nextPageToken, files(id, name)',
    });
    return response.data.files || [];
  } catch (error) {
    if (error instanceof GaxiosError) {
      if (error.status === 401) {
        throw new Error('Auth token expired, please re-authenticate');
      }
      if (error.status === 403) {
        throw new Error('Drive access denied or quota exceeded');
      }
    }
    throw error;
  }
}

// CORRECT: gmail.users.messages.send() inside try-catch
export async function sendGmailCorrect(auth: OAuth2Client, messageData: string) {
  const gmail = google.gmail({ version: 'v1', auth });

  try {
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: messageData,
      },
    });
    return response.data;
  } catch (error) {
    if (error instanceof GaxiosError) {
      console.error(`Gmail send failed: ${error.status}`, error.message);
      throw new Error(`Failed to send email: ${error.message}`);
    }
    throw error;
  }
}

// CORRECT: youtube.videos.insert() inside try-catch
export async function uploadVideoCorrect(auth: OAuth2Client, videoStream: any) {
  const youtube = google.youtube({ version: 'v3', auth });

  try {
    const response = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: { title: 'My Video', description: 'Description' },
        status: { privacyStatus: 'public' },
      },
      media: { mimeType: 'video/mp4', body: videoStream },
    });
    return response.data;
  } catch (error) {
    if (error instanceof GaxiosError) {
      if (error.status === 403) {
        throw new Error('YouTube upload quota exceeded or insufficient permissions');
      }
    }
    throw error;
  }
}
