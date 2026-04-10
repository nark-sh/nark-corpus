import { OAuth2Client, GaxiosError } from 'google-auth-library';

const oauth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

/**
 * PROPER: getToken wrapped in try-catch.
 * Should produce 0 violations.
 */
async function exchangeCodeForTokens(code: string) {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return tokens;
  } catch (error) {
    if (error instanceof GaxiosError) {
      console.error('OAuth token exchange failed:', error.message);
      throw new Error('Authentication failed — invalid or expired code');
    }
    throw error;
  }
}

/**
 * PROPER: getTokenInfo wrapped in try-catch.
 * Should produce 0 violations.
 */
async function validateAccessToken(accessToken: string) {
  try {
    const tokenInfo = await oauth2Client.getTokenInfo(accessToken);
    return tokenInfo;
  } catch (error) {
    console.error('Token validation failed:', error);
    throw new Error('Invalid or expired access token');
  }
}

/**
 * PROPER: GoogleAuth.getClient wrapped in try-catch.
 * Should produce 0 violations.
 */
async function getAuthClient() {
  const { GoogleAuth } = await import('google-auth-library');
  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/cloud-platform',
  });
  try {
    const client = await auth.getClient();
    return client;
  } catch (error) {
    console.error('Failed to load application default credentials:', error);
    throw new Error('Service authentication unavailable');
  }
}
