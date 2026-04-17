import { AuthorizationCode } from 'simple-oauth2';

const client = new AuthorizationCode({
  client: {
    id: 'client-id',
    secret: 'client-secret'
  },
  auth: {
    tokenHost: 'https://oauth-provider.com'
  }
});

// Proper error handling
async function getAccessToken(code: string) {
  try {
    const result = await client.getToken({
      code,
      redirect_uri: 'http://localhost:3000/callback'
    });
    return result.token;
  } catch (error) {
    console.error('Failed to get access token:', error);
    throw error;
  }
}

// Proper error handling
async function refreshToken(token: any) {
  try {
    const accessToken = client.createToken(token);
    const refreshed = await accessToken.refresh();
    return refreshed.token;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    throw error;
  }
}

// @expect-clean
// Proper error handling for revokeAll — handles partial failure case
async function logoutUserSafely(token: any) {
  const accessToken = client.createToken(token);
  try {
    await accessToken.revokeAll();
  } catch (error) {
    // CRITICAL: partial revocation may have occurred — refresh_token may still be valid
    console.error('Token revocation incomplete:', error);
    throw new Error('Logout incomplete — please re-authenticate');
  }
}

// @expect-clean
// Preferred: revoke tokens independently for fine-grained error handling
async function logoutUserIndependently(token: any) {
  const accessToken = client.createToken(token);
  let revokeError: Error | null = null;
  try {
    await accessToken.revoke('access_token');
  } catch (error) {
    console.error('access_token revocation failed:', error);
    revokeError = error as Error;
  }
  try {
    await accessToken.revoke('refresh_token');
  } catch (error) {
    console.error('refresh_token revocation failed:', error);
    revokeError = error as Error;
  }
  if (revokeError) {
    throw new Error('One or more tokens could not be revoked');
  }
}
