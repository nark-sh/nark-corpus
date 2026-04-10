/**
 * Missing error handling for jsonwebtoken
 * This file demonstrates INCORRECT patterns - SHOULD trigger violations
 */

import jwt from 'jsonwebtoken';

const SECRET = 'my-secret-key-for-testing';
const PUBLIC_KEY = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----';

/**
 * ❌ VIOLATION: Missing try-catch on jwt.verify()
 * Should trigger ERROR - crashes on invalid/expired token
 */
async function missingTryCatchVerify(token: string) {
  // NO try-catch\! Will crash if token is invalid or expired
  const decoded = jwt.verify(token, SECRET, {
    algorithms: ['HS256']
  });
  
  console.log('User ID:', decoded.userId);
  return decoded;
}

/**
 * ❌ VIOLATION: Missing try-catch on jwt.sign()
 * Should trigger ERROR - crashes on invalid options
 */
async function missingTryCatchSign(userId: number) {
  // NO try-catch\! Will crash if options are invalid
  const token = jwt.sign(
    { userId },
    SECRET,
    { expiresIn: '1h', algorithm: 'HS256' }
  );
  
  return token;
}

/**
 * ❌ VIOLATION: Not checking callback error parameter
 * Should trigger ERROR - uses decoded without checking err
 */
function notCheckingCallbackError(token: string, callback: (decoded: any) => void) {
  jwt.verify(token, SECRET, { algorithms: ['HS256'] }, (err, decoded) => {
    // BUG: Using decoded without checking err first\!
    // decoded will be undefined if err exists
    console.log('User ID:', decoded.userId); // Can crash\!
    callback(decoded);
  });
}

/**
 * ❌ VIOLATION: Missing algorithm whitelist (vulnerable to CVE-2015-9235)
 * Should trigger WARNING - vulnerable to algorithm confusion
 */
function missingAlgorithmWhitelist(token: string) {
  try {
    // No algorithms option\! Vulnerable to algorithm confusion attack
    const decoded = jwt.verify(token, PUBLIC_KEY);
    return decoded;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

/**
 * ❌ VIOLATION: Multiple issues - no try-catch AND no algorithms
 * Should trigger multiple violations
 */
async function multipleViolations(token: string) {
  // 1. No try-catch
  // 2. No algorithms option
  const decoded = jwt.verify(token, SECRET);
  
  return decoded;
}

/**
 * ❌ VIOLATION: Express middleware without error handling
 */
interface Request {
  headers: { authorization?: string };
  user?: any;
}

interface Response {
  status(code: number): Response;
  json(data: any): void;
}

type NextFunction = () => void;

function unsafeAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (\!token) {
    return res.status(401).json({ error: 'No token' });
  }

  // ❌ No try-catch\! Crashes if token invalid
  const decoded = jwt.verify(token, SECRET, { algorithms: ['HS256'] });
  req.user = decoded;
  next();
}

/**
 * ❌ VIOLATION: Login without error handling on token creation
 */
async function unsafeLogin(email: string, password: string) {
  const user = { id: 123, email, role: 'user' };

  // ❌ No try-catch on jwt.sign()
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    SECRET,
    { expiresIn: '15m' }
  );

  // ❌ No try-catch on jwt.sign()
  const refreshToken = jwt.sign(
    { userId: user.id },
    SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}

/**
 * ❌ VIOLATION: Refresh token without error handling
 */
async function unsafeRefreshToken(refreshToken: string) {
  // ❌ No try-catch on verify
  const decoded = jwt.verify(refreshToken, SECRET) as { userId: number };

  // ❌ No try-catch on sign
  const newAccessToken = jwt.sign(
    { userId: decoded.userId },
    SECRET,
    { expiresIn: '15m' }
  );

  return newAccessToken;
}

/**
 * ❌ VIOLATION: Generic catch without specific error handling
 */
async function genericCatchOnly(token: string) {
  try {
    const decoded = jwt.verify(token, SECRET, { algorithms: ['HS256'] });
    return decoded;
  } catch (error) {
    // Not checking specific error types - less severe but still not ideal
    console.error('Error:', error);
    throw error;
  }
}

/**
 * ❌ VIOLATION: Callback with wrong signature (no err parameter)
 */
function wrongCallbackSignature(token: string) {
  // Callback signature should be (err, decoded), not just (decoded)
  jwt.verify(token, SECRET, (decoded) => {
    // Type error - callback expects (err, decoded) but only has (decoded)
    console.log('User:', decoded);
  });
}

/**
 * ❌ VIOLATION: verify() in conditional without try-catch
 */
function verifyInConditional(token: string | undefined) {
  if (token) {
    // ❌ No try-catch
    const decoded = jwt.verify(token, SECRET);
    console.log('Valid token:', decoded);
  }
}

/**
 * ❌ VIOLATION: Chained operations without error handling
 */
async function chainedOperations(token: string) {
  // ❌ No try-catch - crashes if verify fails
  const decoded = jwt.verify(token, SECRET, { algorithms: ['HS256'] });
  
  // Subsequent operations won't execute if verify throws
  const userId = decoded.userId;
  const user = await fetchUser(userId);
  
  return user;
}

async function fetchUser(id: number) {
  return { id, name: 'User' };
}

export {
  missingTryCatchVerify,
  missingTryCatchSign,
  notCheckingCallbackError,
  missingAlgorithmWhitelist,
  multipleViolations,
  unsafeAuthMiddleware,
  unsafeLogin,
  unsafeRefreshToken,
  genericCatchOnly,
  wrongCallbackSignature,
  verifyInConditional,
  chainedOperations
};
