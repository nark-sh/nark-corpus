/**
 * @auth0/nextjs-auth0 Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Annotations are derived from the contract spec (contract.yaml), NOT from V1 behavior.
 *
 * Contracted functions:
 *   v2/v3 standalone:
 *   - getAccessToken()    postcondition: access-token-error (severity: error)
 *   - handleCallback()    postcondition: callback-handler-error (severity: error)
 *   - handleLogin()       postcondition: login-handler-error (severity: error)
 *   - handleLogout()      postcondition: logout-handler-error (severity: error)
 *
 *   v4 Auth0Client instance methods:
 *   - auth0.getSession()                 postconditions: auth0-get-session-domain-mismatch, auth0-get-session-no-null-check
 *   - auth0.getAccessToken()             postconditions: auth0-v4-access-token-missing-session, auth0-v4-access-token-refresh-failed, auth0-v4-access-token-mfa-required
 *   - auth0.getAccessTokenForConnection() postconditions: auth0-connection-token-missing-session, auth0-connection-token-exchange-failed
 *   - auth0.updateSession()              postconditions: auth0-update-session-unauthenticated, auth0-update-session-server-component-no-persist
 *   - auth0.customTokenExchange()        postconditions: auth0-cte-missing-subject-token, auth0-cte-exchange-failed
 *   - auth0.mfa.getAuthenticators()      postconditions: auth0-mfa-get-authenticators-token-invalid, auth0-mfa-get-authenticators-api-error
 *   - auth0.mfa.challenge()              postconditions: auth0-mfa-challenge-invalid-authenticator, auth0-mfa-challenge-no-factors
 *   - auth0.mfa.verify()                 postcondition: auth0-mfa-verify-invalid-grant
 *   - auth0.mfa.enroll()                 postcondition: auth0-mfa-enroll-unsupported-type
 *   - auth0.getTokenByBackchannelAuth()  postconditions: auth0-ciba-not-supported, auth0-ciba-denied-or-expired
 *
 * Key contract rules:
 *   - All functions can throw and require try-catch
 *   - v4 getAccessToken throws MfaRequiredError — needs instanceof check to handle step-up MFA
 *   - getSession() returns null (not throws) when unauthenticated — destructuring without null check is a bug
 *   - A surrounding try-catch SATISFIES the requirement
 *   - try-finally WITHOUT catch does NOT satisfy the requirement
 */

import { getAccessToken, handleCallback, handleLogin, handleLogout } from '@auth0/nextjs-auth0';
import { Auth0Client } from '@auth0/nextjs-auth0/server';

// ─────────────────────────────────────────────────────────────────────────────
// getAccessToken — bare calls, no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function getToken_noTryCatch(req: any, res: any) {
  // SHOULD_FIRE: access-token-error — getAccessToken throws AccessTokenError, no try-catch
  const { accessToken } = await getAccessToken(req, res);
  return accessToken;
}

export async function getToken_withScopes_noTryCatch(req: any, res: any) {
  // SHOULD_FIRE: access-token-error — getAccessToken with scopes still throws, no try-catch
  const { accessToken } = await getAccessToken(req, res, {
    scopes: ['read:products']
  });
  return accessToken;
}

export async function getToken_partialTryCatch(req: any, res: any) {
  // SHOULD_FIRE: access-token-error — getAccessToken is outside the try-catch block below
  const { accessToken } = await getAccessToken(req, res);
  try {
    const data = JSON.parse('{}');
    return { accessToken, data };
  } catch (e) {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// getAccessToken — properly wrapped
// ─────────────────────────────────────────────────────────────────────────────

export async function getToken_withTryCatch(req: any, res: any) {
  try {
    // SHOULD_NOT_FIRE: inside try-catch, AccessTokenError will be caught
    const { accessToken } = await getAccessToken(req, res);
    return accessToken;
  } catch (error) {
    res.status(401).json({ error: 'Token refresh failed' });
    return null;
  }
}

export async function getToken_withScopes_withTryCatch(req: any, res: any) {
  try {
    // SHOULD_NOT_FIRE: inside try-catch with proper error handling
    const { accessToken } = await getAccessToken(req, res, {
      scopes: ['read:profile', 'write:profile']
    });
    return accessToken;
  } catch (error) {
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// handleCallback — bare calls, no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function callback_noTryCatch(req: any, res: any) {
  // SHOULD_FIRE: callback-handler-error — handleCallback throws CallbackHandlerError, no try-catch
  await handleCallback(req, res);
}

export async function callback_withOptions_noTryCatch(req: any, res: any) {
  // SHOULD_FIRE: callback-handler-error — handleCallback with redirectUri, no try-catch
  await handleCallback(req, res, { redirectUri: '/dashboard' });
}

// ─────────────────────────────────────────────────────────────────────────────
// handleCallback — properly wrapped
// ─────────────────────────────────────────────────────────────────────────────

export async function callback_withTryCatch(req: any, res: any) {
  try {
    // SHOULD_NOT_FIRE: inside try-catch, CallbackHandlerError will be caught
    await handleCallback(req, res, { redirectUri: '/dashboard' });
  } catch (error) {
    res.writeHead(302, { Location: '/error' });
    res.end();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// handleLogin — bare calls, no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function login_noTryCatch(req: any, res: any) {
  // SHOULD_FIRE: login-handler-error — handleLogin throws LoginHandlerError, no try-catch
  await handleLogin(req, res);
}

export async function login_withOptions_noTryCatch(req: any, res: any) {
  // SHOULD_FIRE: login-handler-error — handleLogin with authorizationParams, no try-catch
  await handleLogin(req, res, {
    authorizationParams: { screen_hint: 'signup' }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// handleLogin — properly wrapped
// ─────────────────────────────────────────────────────────────────────────────

export async function login_withTryCatch(req: any, res: any) {
  try {
    // SHOULD_NOT_FIRE: inside try-catch, LoginHandlerError will be caught
    await handleLogin(req, res, { authorizationParams: { prompt: 'login' } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// handleLogout — bare calls, no try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function logout_noTryCatch(req: any, res: any) {
  // SHOULD_FIRE: logout-handler-error — handleLogout throws LogoutHandlerError, no try-catch
  await handleLogout(req, res);
}

export async function logout_withOptions_noTryCatch(req: any, res: any) {
  // SHOULD_FIRE: logout-handler-error — handleLogout with returnTo, no try-catch
  await handleLogout(req, res, { returnTo: '/' });
}

// ─────────────────────────────────────────────────────────────────────────────
// handleLogout — properly wrapped
// ─────────────────────────────────────────────────────────────────────────────

export async function logout_withTryCatch(req: any, res: any) {
  try {
    // SHOULD_NOT_FIRE: inside try-catch, LogoutHandlerError will be caught
    await handleLogout(req, res, { returnTo: '/home' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// v4 Auth0Client.getSession — null-check and domain mismatch
// ─────────────────────────────────────────────────────────────────────────────

const auth0 = new Auth0Client();

export async function getSession_destructureNoNullCheck() {
  // @expect-violation: auth0-get-session-no-null-check
  // SHOULD_FIRE: getSession returns null when unauthenticated — destructuring will throw TypeError
  const { user } = await auth0.getSession() as any;
  return user;
}

export async function getSession_withNullCheck() {
  // @expect-clean
  // SHOULD_NOT_FIRE: null check guards against TypeError
  const session = await auth0.getSession();
  if (!session) return null;
  return session.user;
}

export async function getSession_withTryCatch_noNullCheck() {
  // @expect-violation: auth0-get-session-no-null-check
  // SHOULD_FIRE: try-catch does not prevent the null-destructuring TypeError
  try {
    const { user } = await auth0.getSession() as any;
    return user;
  } catch (error) {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// v4 Auth0Client.getAccessToken — missing try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function v4GetAccessToken_noTryCatch() {
  // @expect-violation: auth0-v4-access-token-missing-session
  // @expect-violation: auth0-v4-access-token-refresh-failed
  // SHOULD_FIRE: getAccessToken throws AccessTokenError, no try-catch
  const { token } = await auth0.getAccessToken();
  return token;
}

export async function v4GetAccessToken_withTryCatch() {
  // @expect-clean
  // SHOULD_NOT_FIRE: properly wrapped in try-catch
  try {
    const { token } = await auth0.getAccessToken();
    return token;
  } catch (error) {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// v4 Auth0Client.updateSession — unauthenticated call
// ─────────────────────────────────────────────────────────────────────────────

export async function updateSession_noTryCatch(session: any) {
  // @expect-violation: auth0-update-session-unauthenticated
  // SHOULD_FIRE: updateSession throws if user not authenticated, no try-catch
  await auth0.updateSession(session);
}

export async function updateSession_withTryCatch(session: any) {
  // @expect-clean
  // SHOULD_NOT_FIRE: properly wrapped in try-catch
  try {
    await auth0.updateSession(session);
  } catch (error) {
    throw new Error('Failed to update session: user not authenticated');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// v4 Auth0Client.customTokenExchange — missing try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function customTokenExchange_noTryCatch(subjectToken: string) {
  // @expect-violation: auth0-cte-exchange-failed
  // SHOULD_FIRE: customTokenExchange throws CustomTokenExchangeError, no try-catch
  const result = await auth0.customTokenExchange({
    subjectToken,
    subjectTokenType: 'urn:ietf:params:oauth:token-type:jwt' as any,
  });
  return result;
}

export async function customTokenExchange_withTryCatch(subjectToken: string) {
  // @expect-clean
  // SHOULD_NOT_FIRE: properly wrapped in try-catch
  try {
    const result = await auth0.customTokenExchange({
      subjectToken,
      subjectTokenType: 'urn:ietf:params:oauth:token-type:jwt' as any,
    });
    return result;
  } catch (error) {
    throw new Error('Token exchange failed');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// v4 Auth0Client.mfa.verify — missing try-catch (most common MFA failure)
// ─────────────────────────────────────────────────────────────────────────────

export async function mfaVerify_noTryCatch(mfaToken: string, otp: string) {
  // @expect-violation: auth0-mfa-verify-invalid-grant
  // SHOULD_FIRE: mfa.verify throws MfaVerifyError on wrong code, no try-catch
  const result = await auth0.mfa.verify({ mfaToken, otp } as any);
  return result;
}

export async function mfaVerify_withTryCatch(mfaToken: string, otp: string) {
  // @expect-clean
  // SHOULD_NOT_FIRE: properly wrapped in try-catch
  try {
    const result = await auth0.mfa.verify({ mfaToken, otp } as any);
    return result;
  } catch (error) {
    return { error: 'Invalid or expired verification code' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// v4 Auth0Client.getTokenByBackchannelAuth — missing try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function backchannelAuth_noTryCatch() {
  // @expect-violation: auth0-ciba-not-supported
  // @expect-violation: auth0-ciba-denied-or-expired
  // SHOULD_FIRE: getTokenByBackchannelAuth throws on CIBA not enabled or user denial, no try-catch
  const result = await auth0.getTokenByBackchannelAuth({
    bindingMessage: 'Approve login on your phone',
    loginHint: { sub: 'auth0|user123' },
  });
  return result;
}

export async function backchannelAuth_withTryCatch() {
  // @expect-clean
  // SHOULD_NOT_FIRE: properly wrapped in try-catch
  try {
    const result = await auth0.getTokenByBackchannelAuth({
      bindingMessage: 'Approve login on your phone',
      loginHint: { sub: 'auth0|user123' },
    });
    return result;
  } catch (error) {
    throw new Error('Backchannel authentication failed or was denied');
  }
}
