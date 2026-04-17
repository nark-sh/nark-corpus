/**
 * google-auth-library Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Annotations are derived from the google-auth-library contract spec (contract.yaml).
 *
 * Key contract rules:
 *   - OAuth2Client.getToken() throws GaxiosError on invalid_grant/network failure → MUST try-catch
 *   - OAuth2Client.getTokenInfo() throws Error if token is invalid → MUST try-catch
 *   - OAuth2Client.verifyIdToken() throws on invalid signature, expiry, audience mismatch → MUST try-catch
 *   - OAuth2Client.refreshAccessToken() throws 'No refresh token is set.' → MUST try-catch
 *   - OAuth2Client.getAccessToken() throws 'No refresh token or refresh handler callback is set.' → MUST try-catch
 *   - GoogleAuth.getApplicationDefault() throws 'Could not load the default credentials' → MUST try-catch
 *   - GoogleAuth.getIdTokenClient() throws when not on GCE → MUST try-catch
 *   - GoogleAuth.getProjectId() throws 'Unable to detect a Project Id' → MUST try-catch
 *   - GoogleAuth.sign() throws 'Cannot sign data without client_email' → MUST try-catch
 *   - JWT.authorize() throws GaxiosError from token endpoint → MUST try-catch
 *   - JWT.fetchIdToken() throws GaxiosError on token endpoint rejection → MUST try-catch
 *   - GoogleAuth.fromStream() throws Error if stream is null/invalid → MUST try-catch
 *   - GoogleAuth.getCredentials() throws 'Unable to find credentials in current environment' → MUST try-catch
 *   - Impersonated.fetchIdToken() throws GaxiosError with IAM status ('PERMISSION_DENIED: unable to impersonate') → MUST try-catch
 *   - A try-catch (any catch block) satisfies the requirement
 *   - A .catch() chain also satisfies the requirement
 *   - try-finally without catch does NOT satisfy the requirement
 */

import { OAuth2Client, GoogleAuth, JWT, GaxiosError } from 'google-auth-library';

const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

// ─── 1. getToken — bare call, no try-catch ────────────────────────────────────

export async function getTokenNoCatch(code: string) {
  // SHOULD_FIRE: get-token-unprotected — getToken makes OAuth2 network call, no try-catch
  const { tokens } = await client.getToken(code);
  return tokens;
}

// ─── 2. getToken — try-catch present ─────────────────────────────────────────

export async function getTokenWithCatch(code: string) {
  try {
    // SHOULD_NOT_FIRE: getToken is inside try-catch — get-token-unprotected requirement satisfied
    const { tokens } = await client.getToken(code);
    return tokens;
  } catch (error) {
    throw error;
  }
}

// ─── 3. getToken — try-finally without catch ─────────────────────────────────

export async function getTokenTryFinallyNoCatch(code: string) {
  try {
    // SHOULD_FIRE: get-token-unprotected — try-finally has no catch clause
    const { tokens } = await client.getToken(code);
    return tokens;
  } finally {
    console.log('auth attempt complete');
  }
}

// ─── 4. getToken with options object — no try-catch ──────────────────────────

export async function getTokenOptionsNoCatch(code: string, redirectUri: string) {
  // SHOULD_FIRE: get-token-unprotected — options-style call, no try-catch
  const { tokens } = await client.getToken({ code, redirect_uri: redirectUri });
  return tokens;
}

// ─── 5. getToken with options object — try-catch present ─────────────────────

export async function getTokenOptionsWithCatch(code: string, redirectUri: string) {
  try {
    // SHOULD_NOT_FIRE: inside try-catch — requirement satisfied
    const { tokens } = await client.getToken({ code, redirect_uri: redirectUri });
    return tokens;
  } catch (err) {
    if (err instanceof GaxiosError) {
      console.error('OAuth error:', err.message);
    }
    throw err;
  }
}

// ─── 6. getTokenInfo — bare call, no try-catch ───────────────────────────────

export async function getTokenInfoNoCatch(accessToken: string) {
  // SHOULD_FIRE: get-token-info-unprotected — docs say "will throw if token is invalid"
  const info = await client.getTokenInfo(accessToken);
  return info;
}

// ─── 7. getTokenInfo — try-catch present ─────────────────────────────────────

export async function getTokenInfoWithCatch(accessToken: string) {
  try {
    // SHOULD_NOT_FIRE: inside try-catch — get-token-info-unprotected requirement satisfied
    const info = await client.getTokenInfo(accessToken);
    return info;
  } catch (error) {
    console.error('Token validation failed:', error);
    throw error;
  }
}

// ─── 8. Real-world pattern (postiz-app): getToken + getTokenInfo sequential ──

export async function authenticate(params: { code: string }) {
  // SHOULD_FIRE: get-token-unprotected — real-world pattern, no error handling
  const { tokens } = await client.getToken(params.code);
  client.setCredentials(tokens);
  return tokens;
}

// ─── 9. verifyIdToken — bare call, no try-catch ───────────────────────────────

// @expect-violation: verify-id-token-unprotected
export async function verifyGoogleTokenNoCatch(idToken: string) {
  // SHOULD_FIRE: verify-id-token-unprotected — throws on invalid signature, expired, audience mismatch
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
}

// ─── 10. verifyIdToken — try-catch present ────────────────────────────────────

// @expect-clean
export async function verifyGoogleTokenWithCatch(idToken: string) {
  try {
    // SHOULD_NOT_FIRE: inside try-catch — verify-id-token-unprotected requirement satisfied
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
  } catch (error) {
    console.error('ID token verification failed:', error);
    throw error;
  }
}

// ─── 11. refreshAccessToken — bare call, no try-catch ─────────────────────────

// @expect-violation: refresh-access-token-unprotected
export async function refreshTokenNoCatch() {
  // SHOULD_FIRE: refresh-access-token-unprotected — throws 'No refresh token is set.' if missing
  const { credentials } = await client.refreshAccessToken();
  return credentials;
}

// ─── 12. refreshAccessToken — try-catch present ───────────────────────────────

// @expect-clean
export async function refreshTokenWithCatch() {
  try {
    // SHOULD_NOT_FIRE: inside try-catch — refresh-access-token-unprotected satisfied
    const { credentials } = await client.refreshAccessToken();
    return credentials;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
}

// ─── 13. getAccessToken — bare call, no try-catch ─────────────────────────────

// @expect-violation: get-access-token-unprotected
export async function getAccessTokenNoCatch() {
  // SHOULD_FIRE: get-access-token-unprotected — throws 'No refresh token or refresh handler callback is set.'
  const { token } = await client.getAccessToken();
  return token;
}

// ─── 14. GoogleAuth.getApplicationDefault — bare call ────────────────────────

const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

// @expect-violation: get-application-default-unprotected
export async function getAppDefaultNoCatch() {
  // SHOULD_FIRE: get-application-default-unprotected — throws 'Could not load the default credentials'
  const { credential, projectId } = await auth.getApplicationDefault();
  return { credential, projectId };
}

// @expect-clean
export async function getAppDefaultWithCatch() {
  try {
    // SHOULD_NOT_FIRE: inside try-catch
    const { credential, projectId } = await auth.getApplicationDefault();
    return { credential, projectId };
  } catch (error) {
    console.error('ADC not configured:', error);
    throw error;
  }
}

// ─── 15. GoogleAuth.getIdTokenClient — bare call ─────────────────────────────

// @expect-violation: get-id-token-client-unprotected
export async function getIdTokenClientNoCatch(targetAudience: string) {
  // SHOULD_FIRE: get-id-token-client-unprotected — throws when not on GCE
  const idClient = await auth.getIdTokenClient(targetAudience);
  return idClient;
}

// ─── 16. GoogleAuth.getProjectId — bare call ─────────────────────────────────

// @expect-violation: get-project-id-unprotected
export async function getProjectIdNoCatch() {
  // SHOULD_FIRE: get-project-id-unprotected — throws 'Unable to detect a Project Id'
  const projectId = await auth.getProjectId();
  return projectId;
}

// ─── 17. GoogleAuth.sign — bare call ─────────────────────────────────────────

// @expect-violation: sign-unprotected
export async function signDataNoCatch(data: string) {
  // SHOULD_FIRE: sign-unprotected — throws 'Cannot sign data without client_email'
  const signature = await auth.sign(data);
  return signature;
}

// ─── 18. JWT.authorize — bare call ───────────────────────────────────────────

const jwtClient = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY,
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

// @expect-violation: jwt-authorize-unprotected
export async function jwtAuthorizeNoCatch() {
  // SHOULD_FIRE: jwt-authorize-unprotected — GaxiosError on invalid_grant, unauthorized_client
  const credentials = await jwtClient.authorize();
  return credentials;
}

// @expect-clean
export async function jwtAuthorizeWithCatch() {
  try {
    // SHOULD_NOT_FIRE: inside try-catch — jwt-authorize-unprotected satisfied
    const credentials = await jwtClient.authorize();
    return credentials;
  } catch (error) {
    console.error('JWT authorization failed:', error);
    throw error;
  }
}

// ─── 19. JWT.fetchIdToken — bare call ────────────────────────────────────────

// @expect-violation: jwt-fetch-id-token-unprotected
export async function fetchIdTokenNoCatch(targetAudience: string) {
  // SHOULD_FIRE: jwt-fetch-id-token-unprotected — GaxiosError on token endpoint rejection; Error if idToken missing from response
  const idToken = await jwtClient.fetchIdToken(targetAudience);
  return idToken;
}

// @expect-clean
export async function fetchIdTokenWithCatch(targetAudience: string) {
  try {
    // SHOULD_NOT_FIRE: inside try-catch — jwt-fetch-id-token-unprotected satisfied
    const idToken = await jwtClient.fetchIdToken(targetAudience);
    return idToken;
  } catch (error) {
    console.error('ID token fetch failed:', error);
    throw error;
  }
}

// ─── 20. GoogleAuth.fromStream — bare call, no try-catch ─────────────────────

// @expect-violation: from-stream-unprotected
export async function loadCredsFromStreamNoCatch(stream: NodeJS.ReadableStream) {
  // SHOULD_FIRE: from-stream-unprotected — throws if stream is null/invalid or JSON parse fails
  const client = await auth.fromStream(stream);
  return client;
}

// @expect-clean
export async function loadCredsFromStreamWithCatch(stream: NodeJS.ReadableStream) {
  try {
    // SHOULD_NOT_FIRE: inside try-catch — from-stream-unprotected satisfied
    const client = await auth.fromStream(stream);
    return client;
  } catch (error) {
    console.error('Credential stream load failed:', error);
    throw error;
  }
}

// ─── 21. GoogleAuth.getCredentials — bare call, no try-catch ─────────────────

// @expect-violation: get-credentials-unprotected
export async function getCredentialsNoCatch() {
  // SHOULD_FIRE: get-credentials-unprotected — throws 'Unable to find credentials in current environment'
  const creds = await auth.getCredentials();
  return creds;
}

// @expect-clean
export async function getCredentialsWithCatch() {
  try {
    // SHOULD_NOT_FIRE: inside try-catch — get-credentials-unprotected satisfied
    const creds = await auth.getCredentials();
    return creds.client_email;
  } catch (error) {
    console.error('No credentials found:', error);
    throw error;
  }
}

// ─── 22. Impersonated.fetchIdToken — bare call, no try-catch ─────────────────

import { Impersonated } from 'google-auth-library';

const impersonatedClient = new Impersonated({
  sourceClient: jwtClient,
  targetPrincipal: 'target-sa@project.iam.gserviceaccount.com',
  targetScopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

// @expect-violation: impersonated-fetch-id-token-unprotected
export async function impersonatedFetchIdTokenNoCatch(audience: string) {
  // SHOULD_FIRE: jwt-fetch-id-token-unprotected — GaxiosError when source token fails or IAM API returns PERMISSION_DENIED/NOT_FOUND (impersonated client)
  const idToken = await impersonatedClient.fetchIdToken(audience);
  return idToken;
}

// @expect-clean
export async function impersonatedFetchIdTokenWithCatch(audience: string) {
  try {
    // SHOULD_NOT_FIRE: inside try-catch — impersonated-fetch-id-token-unprotected satisfied
    const idToken = await impersonatedClient.fetchIdToken(audience);
    return idToken;
  } catch (error) {
    console.error('Impersonated ID token fetch failed:', error);
    throw error;
  }
}
