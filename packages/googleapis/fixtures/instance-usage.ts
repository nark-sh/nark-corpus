/**
 * Instance usage patterns for googleapis
 * Tests detection of API calls through service instances.
 */

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Test: service instance stored in class property
export class GoogleApiClient {
  private auth: OAuth2Client;

  constructor(auth: OAuth2Client) {
    this.auth = auth;
  }

  // VIOLATION: no try-catch on API call
  async getChannelInfo(channelId: string) {
    const youtube = google.youtube({ version: 'v3', auth: this.auth });

    // Should flag — no error handling
    const response = await youtube.channels.list({
      part: ['snippet'],
      id: [channelId],
    });
    return response.data.items?.[0];
  }

  // CORRECT: try-catch present
  async getDriveFiles() {
    const drive = google.drive({ version: 'v3', auth: this.auth });

    try {
      const response = await drive.files.list({ pageSize: 10 });
      return response.data.files || [];
    } catch (error) {
      console.error('Drive API error:', error);
      return [];
    }
  }
}

// Test: service instance in module scope
const globalAuth = new OAuth2Client();
const youtubeService = google.youtube({ version: 'v3', auth: globalAuth });

// VIOLATION: module-level service call without try-catch
export async function getVideoDetails(videoId: string) {
  const response = await youtubeService.videos.list({
    part: ['snippet', 'statistics'],
    id: [videoId],
  });
  return response.data.items?.[0];
}
