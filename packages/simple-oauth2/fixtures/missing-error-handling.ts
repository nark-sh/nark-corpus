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

// @expect-violation: revokeall-partial-failure
// @expect-violation: revokeall-network-error
// Missing error handling - revokeAll can fail (leaving refresh_token active)
async function logoutUser(token: any) {
  const accessToken = client.createToken(token);
  await accessToken.revokeAll();
  // User appears logged out but if revokeAll throws, refresh_token may still be valid
}

// @expect-violation: revokeall-partial-failure
// @expect-violation: revokeall-network-error
// Missing error handling - revokeAll in a logout handler
async function handleLogout(token: any) {
  const accessToken = client.createToken(token);
  // No try-catch — if access_token revoke fails, refresh_token is never revoked
  await accessToken.revokeAll();
}
