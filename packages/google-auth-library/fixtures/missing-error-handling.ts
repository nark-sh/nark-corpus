import { OAuth2Client } from 'google-auth-library';

const oauth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

/**
 * MISSING error handling: getToken() without try-catch.
 * Should trigger ERROR violation.
 * Pattern from real repos: gitroomhq/postiz-app, civitai, google/clasp
 */
async function authenticate(code: string) {
  // ❌ No try-catch — GaxiosError will propagate if code is invalid/expired
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
}

/**
 * MISSING error handling: getTokenInfo() without try-catch.
 * Should trigger ERROR violation.
 * Docs explicitly state: "This method will throw if the token is invalid"
 */
async function validateToken(accessToken: string) {
  // ❌ No try-catch — throws Error if token is invalid
  const tokenInfo = await oauth2Client.getTokenInfo(accessToken);
  return tokenInfo;
}

/**
 * Real-world antipattern from postiz-app:
 * getToken() and getTokenInfo() called sequentially without error handling.
 */
async function authenticateAndValidate(params: { code: string }) {
  const { tokens } = await oauth2Client.getToken(params.code); // ❌
  oauth2Client.setCredentials(tokens);
  const { scopes } = await oauth2Client.getTokenInfo(tokens.access_token!); // ❌
  return { tokens, scopes };
}
