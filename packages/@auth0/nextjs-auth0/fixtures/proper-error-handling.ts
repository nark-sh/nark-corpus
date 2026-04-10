/**
 * Proper error handling fixtures for @auth0/nextjs-auth0
 * All functions here use correct try-catch patterns.
 * Expected: 0 violations
 */

import { getAccessToken, handleCallback, handleLogin, handleLogout } from '@auth0/nextjs-auth0';

// ✅ CORRECT: getAccessToken wrapped in try-catch
async function getTokenWithErrorHandling(req: any, res: any) {
  try {
    const { accessToken } = await getAccessToken(req, res);
    return accessToken;
  } catch (error) {
    res.status(401).json({ message: 'Authentication required' });
    return null;
  }
}

// ✅ CORRECT: getAccessToken with scopes, properly wrapped
async function getTokenWithScopes(req: any, res: any) {
  try {
    const { accessToken } = await getAccessToken(req, res, {
      scopes: ['read:products', 'write:products']
    });
    return accessToken;
  } catch (error) {
    // Handle AccessTokenError — could be expired refresh token
    res.status(401).json({ error: 'Token refresh failed, please re-authenticate' });
    return null;
  }
}

// ✅ CORRECT: getAccessToken in an API handler, with full error handling
async function protectedApiHandler(req: any, res: any) {
  try {
    const { accessToken } = await getAccessToken(req, res);
    const response = await fetch('https://api.example.com/data', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    if (error && (error as any).code === 'ERR_MISSING_REFRESH_TOKEN') {
      res.status(401).json({ error: 'Please sign in again' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

// ✅ CORRECT: handleCallback with try-catch
async function customCallbackHandler(req: any, res: any) {
  try {
    await handleCallback(req, res, {
      redirectUri: '/dashboard'
    });
  } catch (error) {
    res.writeHead(302, { Location: '/login?error=callback_failed' });
    res.end();
  }
}

// ✅ CORRECT: handleLogin with try-catch
async function customLoginHandler(req: any, res: any) {
  try {
    await handleLogin(req, res, {
      authorizationParams: { prompt: 'login' }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
}

// ✅ CORRECT: handleLogout with try-catch
async function customLogoutHandler(req: any, res: any) {
  try {
    await handleLogout(req, res, {
      returnTo: '/'
    });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
}
