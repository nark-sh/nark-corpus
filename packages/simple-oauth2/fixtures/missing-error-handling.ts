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

// Missing error handling - getToken can fail
async function getAccessToken(code: string) {
  const result = await client.getToken({
    code,
    redirect_uri: 'http://localhost:3000/callback'
  });
  return result.token;
}

// Missing error handling - refresh can fail
async function refreshToken(token: any) {
  const accessToken = client.createToken(token);
  const refreshed = await accessToken.refresh();
  return refreshed.token;
}
