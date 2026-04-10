import { OAuth2Client } from 'google-auth-library';

/**
 * Tests instance-based detection patterns.
 * oauth2Client is stored as a class property and called without try-catch.
 */
class YouTubeAuthService {
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new OAuth2Client({
      clientId: process.env.YOUTUBE_CLIENT_ID,
      clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
      redirectUri: process.env.YOUTUBE_REDIRECT_URI,
    });
  }

  /**
   * ❌ Instance method calling getToken without try-catch.
   * Should trigger ERROR violation.
   */
  async getRefreshToken(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  /**
   * ❌ Instance method calling getTokenInfo without try-catch.
   * Should trigger ERROR violation.
   */
  async validateUserToken(accessToken: string) {
    const info = await this.oauth2Client.getTokenInfo(accessToken);
    return info;
  }
}

/**
 * Factory pattern — client returned from function, called without try-catch.
 */
function createOAuth2Client() {
  return new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  });
}

async function exchangeToken(code: string) {
  const client = createOAuth2Client();
  // ❌ No try-catch
  const { tokens } = await client.getToken(code);
  return tokens;
}
