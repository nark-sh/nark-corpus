/**
 * @auth0/nextjs-auth0 Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Annotations are derived from the contract spec (contract.yaml), NOT from V1 behavior.
 *
 * Contracted functions (all standalone exports from '@auth0/nextjs-auth0'):
 *   - getAccessToken()    postcondition: access-token-error (severity: error)
 *   - handleCallback()    postcondition: callback-handler-error (severity: error)
 *   - handleLogin()       postcondition: login-handler-error (severity: error)
 *   - handleLogout()      postcondition: logout-handler-error (severity: error)
 *
 * Key contract rules:
 *   - All 4 functions can throw and require try-catch
 *   - getAccessToken throws AccessTokenError on refresh failure (common in production)
 *   - handleCallback throws CallbackHandlerError on OAuth callback failure
 *   - handleLogin throws LoginHandlerError on configuration/redirect failure
 *   - handleLogout throws LogoutHandlerError on logout failure
 *   - A surrounding try-catch SATISFIES the requirement
 *   - try-finally WITHOUT catch does NOT satisfy the requirement
 */

import { getAccessToken, handleCallback, handleLogin, handleLogout } from '@auth0/nextjs-auth0';

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
