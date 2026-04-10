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
