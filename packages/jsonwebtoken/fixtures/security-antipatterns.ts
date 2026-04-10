/**
 * Security antipatterns for jsonwebtoken
 * This file demonstrates CRITICAL security bugs beyond just missing try-catch
 */

import jwt from 'jsonwebtoken';

const SECRET = 'my-secret-key-for-testing';
const PUBLIC_KEY = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----';

/**
 * ❌ CRITICAL SECURITY BUG: Using jwt.decode() for authentication
 * Should trigger WARNING - complete authentication bypass
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

function authenticateWithDecode(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (\!token) {
    return res.status(401).json({ error: 'No token' });
  }

  // ❌ CRITICAL: decode() does NOT verify signature\!
  const decoded = jwt.decode(token) as any;

  if (decoded && decoded.userId) {
    // ATTACKER CAN FORGE ANY TOKEN\! No signature verification\!
    req.user = decoded;
    return next();
  }

  return res.status(401).json({ error: 'Invalid token' });
}

/**
 * ❌ CRITICAL: Using decode() to check admin status
 */
function checkAdminWithDecode(token: string) {
  const decoded = jwt.decode(token) as any;

  // SECURITY BYPASS: Attacker can create token with isAdmin: true
  if (decoded && decoded.isAdmin) {
    return true; // ATTACKER GRANTED ADMIN ACCESS\!
  }

  return false;
}

/**
 * ❌ CRITICAL: Algorithm confusion vulnerability (CVE-2015-9235)
 */
function algorithmConfusionVulnerable(token: string) {
  try {
    // No algorithms option - accepts any algorithm from token header\!
    // Attacker can change RS256 → HS256 and use public key as HMAC secret
    const decoded = jwt.verify(token, PUBLIC_KEY);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

/**
 * ❌ SECURITY ISSUE: Exposing error details to client
 */
function exposingErrorDetails(token: string, res: Response) {
  try {
    const decoded = jwt.verify(token, SECRET, { algorithms: ['HS256'] });
    return res.status(200).json({ user: decoded });
  } catch (error) {
    // ❌ Exposing error.message reveals: "invalid signature", "jwt malformed", etc.
    // Information disclosure - attacker learns about token structure
    return res.status(401).json({ error: (error as Error).message });
  }
}

/**
 * ❌ SECURITY ISSUE: Weak secret
 */
function weakSecret() {
  const WEAK_SECRET = 'password123'; // ❌ Too weak - can be brute-forced\!

  const token = jwt.sign(
    { userId: 123, isAdmin: true },
    WEAK_SECRET,
    { expiresIn: '1h', algorithm: 'HS256' }
  );

  return token;
}

/**
 * ❌ SECURITY ISSUE: No token expiration
 */
function noExpiration(userId: number) {
  try {
    // ❌ No expiresIn - token never expires\!
    const token = jwt.sign(
      { userId },
      SECRET,
      { algorithm: 'HS256' }
    );

    return token;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

/**
 * ❌ SECURITY ISSUE: Using user input as secret
 */
async function userInputAsSecret(token: string, userProvidedSecret: string) {
  try {
    // ❌ DANGEROUS: Never use user input as secret\!
    // Could lead to CVE-2022-23529 (object injection)
    const decoded = jwt.verify(token, userProvidedSecret, {
      algorithms: ['HS256']
    });
    return decoded;
  } catch (error) {
    throw error;
  }
}

/**
 * ❌ SECURITY ISSUE: Ignoring token expiration
 */
function ignoringExpiration(token: string) {
  try {
    const decoded = jwt.verify(token, SECRET, {
      algorithms: ['HS256'],
      ignoreExpiration: true // ❌ BAD: Bypasses expiration check\!
    });
    return decoded;
  } catch (error) {
    throw error;
  }
}

/**
 * ✅ CORRECT (for comparison): Secure token verification
 */
function secureTokenVerification(token: string) {
  try {
    const decoded = jwt.verify(token, SECRET, {
      algorithms: ['HS256'],        // ✅ Algorithm whitelist
      audience: 'myapp',             // ✅ Validate audience
      issuer: 'auth-service',        // ✅ Validate issuer
      maxAge: '2h',                  // ✅ Additional age limit
      clockTolerance: 60             // ✅ Allow 60s clock skew
    });

    return { valid: true, payload: decoded };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, reason: 'expired', expiredAt: error.expiredAt };
    }
    if (error instanceof jwt.JsonWebTokenError) {
      // Log internally but don't expose details
      console.error('Token validation failed:', error.message);
      return { valid: false, reason: 'invalid' };
    }
    throw error;
  }
}

/**
 * ✅ CORRECT: Only use decode() for debugging, not authentication
 */
function correctDecodeUsage(token: string) {
  // ✅ CORRECT: First verify the token
  try {
    jwt.verify(token, SECRET, { algorithms: ['HS256'] });
    
    // Now safe to decode for additional info (optional)
    const decoded = jwt.decode(token, { complete: true });
    console.log('Token algorithm:', decoded?.header.alg);
    console.log('Token payload:', decoded?.payload);
    
    // Verification passed - can make security decisions
    return true;
  } catch (error) {
    console.error('Invalid token');
    return false;
  }
}

/**
 * ❌ MIXED: decode() for authentication decision (WRONG)
 */
function mixedDecodeAndVerify(token: string) {
  // ❌ Using decode() result for authentication check
  const decoded = jwt.decode(token) as any;
  
  if (decoded && decoded.role === 'admin') {
    // ❌ WRONG: Making auth decision based on decode()\!
    // Should use verify() instead
    return { isAdmin: true, userId: decoded.userId };
  }
  
  return { isAdmin: false };
}

/**
 * ❌ SECURITY ISSUE: Accepting 'none' algorithm
 */
function acceptingNoneAlgorithm(token: string) {
  try {
    // ❌ CRITICAL: Allowing 'none' algorithm = no signature verification\!
    const decoded = jwt.verify(token, SECRET, {
      algorithms: ['HS256', 'none'] // ❌ Never allow 'none'\!
    });
    return decoded;
  } catch (error) {
    throw error;
  }
}

export {
  authenticateWithDecode,
  checkAdminWithDecode,
  algorithmConfusionVulnerable,
  exposingErrorDetails,
  weakSecret,
  noExpiration,
  userInputAsSecret,
  ignoringExpiration,
  secureTokenVerification,
  correctDecodeUsage,
  mixedDecodeAndVerify,
  acceptingNoneAlgorithm
};
