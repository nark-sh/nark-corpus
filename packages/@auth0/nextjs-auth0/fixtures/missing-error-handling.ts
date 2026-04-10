/**
 * Missing error handling fixtures for @auth0/nextjs-auth0
 * All functions here are missing required try-catch blocks.
 * Expected: multiple ERROR violations
 */

import { getAccessToken, handleCallback, handleLogin, handleLogout } from '@auth0/nextjs-auth0';

// ❌ MISSING try-catch: getAccessToken can throw AccessTokenError
async function getTokenWithoutErrorHandling(req: any, res: any) {
  const { accessToken } = await getAccessToken(req, res);
  return accessToken;
}

// ❌ MISSING try-catch: getAccessToken with scopes still throws
async function getTokenWithScopesNoHandling(req: any, res: any) {
  const { accessToken } = await getAccessToken(req, res, {
    scopes: ['read:products']
  });
  const response = await fetch('https://api.example.com/data', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return response.json();
}

// ❌ MISSING try-catch: common antipattern from official docs
async function protectedApiHandlerNoTryCatch(req: any, res: any) {
  const { accessToken } = await getAccessToken(req, res);
  const response = await fetch('https://external-api.com/products', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const data = await response.json();
  res.status(200).json(data);
}

// ❌ MISSING try-catch: handleCallback in custom handler
async function customCallbackNoHandling(req: any, res: any) {
  await handleCallback(req, res, {
    redirectUri: '/dashboard'
  });
}

// ❌ MISSING try-catch: handleLogin in custom handler
async function customLoginNoHandling(req: any, res: any) {
  await handleLogin(req, res, {
    authorizationParams: { screen_hint: 'signup' }
  });
}

// ❌ MISSING try-catch: handleLogout in custom handler
async function customLogoutNoHandling(req: any, res: any) {
  await handleLogout(req, res);
}
