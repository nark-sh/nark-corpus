/**
 * Proper error handling for jsonwebtoken
 * This file demonstrates CORRECT patterns - should NOT trigger violations
 */

import jwt from 'jsonwebtoken';

const SECRET = 'my-secret-key-for-testing';
const PUBLIC_KEY = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----';

/**
 * ✅ CORRECT: jwt.verify() with proper try-catch and algorithm whitelist
 */
async function properTokenVerification(token: string) {
  try {
    const decoded = jwt.verify(token, SECRET, {
      algorithms: ['HS256'], // Prevent CVE-2015-9235
      audience: 'myapp',
      issuer: 'auth-service'
    });
    
    console.log('Token valid:', decoded);
    return { valid: true, payload: decoded };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error('Token expired at:', error.expiredAt);
      return { valid: false, reason: 'expired' };
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error('Invalid token:', error.message);
      return { valid: false, reason: 'invalid' };
    } else if (error instanceof jwt.NotBeforeError) {
      console.error('Token not active until:', error.date);
      return { valid: false, reason: 'not-active' };
    }
    throw error; // Unexpected error
  }
}

/**
 * ✅ CORRECT: jwt.sign() with proper try-catch
 */
async function properTokenCreation(userId: number) {
  try {
    const token = jwt.sign(
      { userId, email: 'user@example.com' },
      SECRET,
      {
        expiresIn: '1h',
        algorithm: 'HS256',
        audience: 'myapp',
        issuer: 'auth-service'
      }
    );
    
    return { success: true, token };
  } catch (error) {
    console.error('Token signing failed:', error);
    return { success: false, error: 'Failed to create token' };
  }
}

/**
 * ✅ CORRECT: Callback-style with error checking
 */
function callbackStyleVerification(token: string, callback: (err: Error | null, decoded?: any) => void) {
  jwt.verify(token, SECRET, { algorithms: ['HS256'] }, (err, decoded) => {
    if (err) {
      // Check error first\!
      if (err.name === 'TokenExpiredError') {
        return callback(new Error('Token expired'));
      }
      if (err.name === 'JsonWebTokenError') {
        return callback(new Error('Invalid token'));
      }
      return callback(err);
    }
    
    // Now safe to use decoded
    callback(null, decoded);
  });
}

/**
 * ✅ CORRECT: Express middleware with proper error handling
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

function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (\!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, SECRET, {
      algorithms: ['HS256'],
      audience: 'myapp'
    });
    
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    return res.status(500).json({ error: 'Internal error' });
  }
}

/**
 * ✅ CORRECT: Refresh token rotation with error handling
 */
async function refreshAccessToken(refreshToken: string) {
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, SECRET, {
      algorithms: ['HS256']
    }) as { userId: number };

    // Generate new access token
    try {
      const newAccessToken = jwt.sign(
        { userId: decoded.userId },
        SECRET,
        { expiresIn: '15m', algorithm: 'HS256' }
      );
      
      return { success: true, accessToken: newAccessToken };
    } catch (signError) {
      console.error('Failed to sign new token:', signError);
      throw new Error('Token refresh failed');
    }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired - please login again');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    }
    throw error;
  }
}

/**
 * ✅ CORRECT: RSA verification with algorithm whitelist
 */
function verifyRSAToken(token: string) {
  try {
    const decoded = jwt.verify(token, PUBLIC_KEY, {
      algorithms: ['RS256'] // Prevent algorithm confusion
    });
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      // Could be "invalid algorithm" if attacker tried HS256
      console.error('Token verification failed:', error.message);
    }
    throw error;
  }
}

/**
 * ✅ CORRECT: Using jwt.decode() ONLY for debugging (not authentication)
 */
function debugTokenOnly(token: string) {
  // This is fine - just reading payload for logging, NOT for authentication
  const decoded = jwt.decode(token, { complete: true });
  
  if (\!decoded) {
    console.log('Invalid token format');
    return;
  }
  
  console.log('Token header:', decoded.header);
  console.log('Token payload:', decoded.payload);
  console.log('Token signature:', decoded.signature);
  
  // NOT used for any security decisions\!
}

/**
 * ✅ CORRECT: Full authentication flow with comprehensive error handling
 */
async function loginAndGenerateTokens(email: string, password: string) {
  // Assume user validation happens here
  const user = { id: 123, email, role: 'user' };

  try {
    // Generate access token
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      SECRET,
      { expiresIn: '15m', algorithm: 'HS256', audience: 'myapp' }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user.id },
      SECRET,
      { expiresIn: '7d', algorithm: 'HS256', audience: 'myapp' }
    );

    return {
      success: true,
      accessToken,
      refreshToken
    };
  } catch (error) {
    console.error('Token generation error:', error);
    return {
      success: false,
      error: 'Failed to generate tokens'
    };
  }
}

export {
  properTokenVerification,
  properTokenCreation,
  callbackStyleVerification,
  authenticateJWT,
  refreshAccessToken,
  verifyRSAToken,
  debugTokenOnly,
  loginAndGenerateTokens
};
