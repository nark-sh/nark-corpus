/**
 * Instance usage fixtures for @auth0/nextjs-auth0
 * Tests detection when functions are used via destructuring or re-assignment.
 * Expected: violations where try-catch is missing
 */

import { getAccessToken, withApiAuthRequired } from '@auth0/nextjs-auth0';

// ❌ MISSING try-catch: inside withApiAuthRequired handler
export const productsHandler = withApiAuthRequired(async (req: any, res: any) => {
  const { accessToken } = await getAccessToken(req, res);
  res.status(200).json({ token: accessToken });
});

// ✅ CORRECT: withApiAuthRequired with properly handled getAccessToken
export const safeProductsHandler = withApiAuthRequired(async (req: any, res: any) => {
  try {
    const { accessToken } = await getAccessToken(req, res);
    res.status(200).json({ token: accessToken });
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
});

// ❌ MISSING try-catch: multiple getAccessToken calls, none wrapped
async function fetchMultipleApis(req: any, res: any) {
  const { accessToken: token1 } = await getAccessToken(req, res, { scopes: ['read:profile'] });
  const { accessToken: token2 } = await getAccessToken(req, res, { scopes: ['read:orders'] });
  return { token1, token2 };
}
