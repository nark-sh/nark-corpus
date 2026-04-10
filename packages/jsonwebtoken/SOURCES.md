# Sources: jsonwebtoken

## Official Documentation

- **npm:** https://www.npmjs.com/package/jsonwebtoken
- **GitHub:** https://github.com/auth0/node-jsonwebtoken
- **README:** https://github.com/auth0/node-jsonwebtoken/blob/master/README.md
- **Auth0 JWT Docs:** https://auth0.com/docs/secure/tokens/json-web-tokens

## Error Types and Handling

### TokenExpiredError

Thrown when token's `exp` claim is before current time.

**Properties:**
- `name: 'TokenExpiredError'`
- `message: 'jwt expired'`
- `expiredAt: Date` - timestamp when token expired

**Source:** https://github.com/auth0/node-jsonwebtoken#errors--codes

### JsonWebTokenError

General error for invalid tokens, signatures, algorithms, claims, etc.

**Common Messages:**
- `'jwt malformed'` - invalid token structure
- `'invalid signature'` - signature verification failed
- `'invalid algorithm'` - algorithm not in whitelist
- `'jwt audience invalid. expected: [expected]'` - audience mismatch
- `'jwt issuer invalid. expected: [expected]'` - issuer mismatch

**Source:** https://github.com/auth0/node-jsonwebtoken#errors--codes

### NotBeforeError

Thrown when current time is before token's `nbf` claim.

**Properties:**
- `name: 'NotBeforeError'`
- `message: 'jwt not active'`
- `date: Date` - when token becomes valid

**Source:** https://github.com/auth0/node-jsonwebtoken#errors--codes

## Security Vulnerabilities

### CVE-2015-9235: Algorithm Confusion Attack

**CVSS:** 7.5 HIGH
**Affected:** jsonwebtoken < 4.2.2
**Fixed:** v4.2.2 (2015)

**Description:**
Attacker can bypass signature verification by changing algorithm from asymmetric (RS256) to symmetric (HS256) and using public key as HMAC secret.

**Attack Vector:**
1. Server uses RS256 with RSA keypair
2. Attacker obtains public key (usually public info)
3. Attacker creates token with `alg: HS256` in header
4. Attacker signs with HMAC-SHA256 using public key as secret
5. Server verifies with public key as HMAC secret (instead of RSA verification)
6. Signature validates\! Authentication bypassed.

**Mitigation:**
Always specify `algorithms` option in `jwt.verify()`:

```javascript
jwt.verify(token, publicKey, { algorithms: ['RS256'] });
```

**Sources:**
- https://nvd.nist.gov/vuln/detail/CVE-2015-9235
- https://github.com/advisories/GHSA-c7hr-j4mj-j2w6
- https://security.snyk.io/vuln/npm:jsonwebtoken:20150331
- https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/

### CVE-2022-23529: JWT Secret Poisoning

**CVSS:** 7.6 HIGH
**Affected:** jsonwebtoken <= 8.5.1
**Fixed:** v9.0.0 (December 2022)

**Description:**
Malicious actor can inject arbitrary objects into server's JavaScript runtime through insecure deserialization in `jwt.verify()`, potentially leading to Remote Code Execution (RCE).

**Requirements for Exploitation:**
- Attacker can modify key retrieval parameter
- Application passes user-controlled input to jwt.verify()
- Attacker crafts malicious object that triggers code execution

**Mitigation:**
1. Upgrade to jsonwebtoken >= 9.0.0
2. Never use user input as secret
3. Load keys from trusted sources only
4. Validate all inputs before passing to JWT functions

**Sources:**
- https://unit42.paloaltonetworks.com/jsonwebtoken-vulnerability-cve-2022-23529/
- https://github.com/advisories/GHSA-8cf7-32gw-wr33
- https://anchore.com/blog/finding-and-fixing-the-jsonwebtoken-vulnerabilities/

### CVE-2022-23540: Invalid Token Parsing

**CVSS:** 5.9 MEDIUM
**Affected:** jsonwebtoken <= 8.5.1
**Fixed:** v9.0.0 (December 2022)

**Description:**
In certain edge cases, `jwt.verify()` can fail to properly validate malformed tokens, potentially allowing invalid tokens to be accepted.

**Mitigation:**
Upgrade to jsonwebtoken >= 9.0.0

**Source:** https://www.acunetix.com/vulnerabilities/sca/cve-2022-23540-vulnerability-in-npm-package-jsonwebtoken/

## Common Mistakes and Antipatterns

### 1. Using jwt.decode() for Authentication

**CRITICAL SECURITY BUG**

`jwt.decode()` does NOT verify signatures - it only decodes the token.

**Vulnerable Code:**
```javascript
const decoded = jwt.decode(userToken);
if (decoded.isAdmin) {
  grantAdminAccess(); // ATTACKER CAN FORGE TOKENS\!
}
```

**Correct Code:**
```javascript
try {
  const decoded = jwt.verify(userToken, secret, { algorithms: ['HS256'] });
  if (decoded.isAdmin) {
    grantAdminAccess(); // Signature verified
  }
} catch (error) {
  // Invalid token
}
```

**Sources:**
- https://github.com/nextauthjs/next-auth/issues/748
- https://www.invicti.com/blog/web-security/json-web-token-jwt-attacks-vulnerabilities/

### 2. Missing Error Handling on verify()

**Common Pattern:**
```javascript
// BUG: No try-catch - crashes on invalid/expired token
const decoded = jwt.verify(token, secret);
console.log(decoded.userId);
```

**Correct Pattern:**
```javascript
try {
  const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
  console.log(decoded.userId);
} catch (error) {
  if (error instanceof jwt.TokenExpiredError) {
    // Handle expiration
  } else if (error instanceof jwt.JsonWebTokenError) {
    // Handle invalid token
  }
}
```

### 3. Not Checking Callback Error Parameter

**Vulnerable Code:**
```javascript
jwt.verify(token, secret, (err, decoded) => {
  console.log(decoded.userId); // BUG: decoded undefined if err exists\!
});
```

**Correct Code:**
```javascript
jwt.verify(token, secret, (err, decoded) => {
  if (err) {
    console.error('Verification failed:', err.message);
    return;
  }
  console.log(decoded.userId);
});
```

### 4. Missing algorithms Option

**Vulnerable (CVE-2015-9235):**
```javascript
jwt.verify(token, publicKey); // No algorithm whitelist\!
```

**Secure:**
```javascript
jwt.verify(token, publicKey, { algorithms: ['RS256'] });
```

### 5. Exposing Error Details to Clients

**Bad Practice:**
```javascript
catch (error) {
  res.status(401).json({ error: error.message });
  // Exposes: "invalid signature", "jwt malformed", etc.
}
```

**Best Practice:**
```javascript
catch (error) {
  console.error('JWT error:', error.message); // Log internally
  res.status(401).json({ error: 'Unauthorized' }); // Generic message
}
```

## Best Practices

### 1. Always Wrap verify() in Try-Catch

```javascript
try {
  const decoded = jwt.verify(token, secret, {
    algorithms: ['HS256'],
    audience: 'myapp',
    issuer: 'auth-service'
  });
  return decoded;
} catch (error) {
  if (error instanceof jwt.TokenExpiredError) {
    // Prompt user to refresh token
  } else if (error instanceof jwt.JsonWebTokenError) {
    // Invalid token
  }
  throw error;
}
```

### 2. Always Specify algorithms Option

```javascript
// HS256 for symmetric (shared secret)
jwt.verify(token, secret, { algorithms: ['HS256'] });

// RS256 for asymmetric (public/private key)
jwt.verify(token, publicKey, { algorithms: ['RS256'] });
```

### 3. Always Set Token Expiration

```javascript
const token = jwt.sign(
  { userId: 123 },
  secret,
  {
    expiresIn: '15m', // Access token
    algorithm: 'HS256'
  }
);
```

**Recommended Expiration:**
- Access tokens: 15 minutes to 1 hour
- Refresh tokens: 7 to 30 days

### 4. Use Strong Secrets

For HMAC algorithms (HS256, HS384, HS512):

```javascript
// ❌ WEAK
const secret = 'password123';

// ✅ STRONG
const secret = crypto.randomBytes(64).toString('hex');
```

**Minimum Secret Strength:**
- HS256: 256+ bits (32+ bytes)
- HS384: 384+ bits (48+ bytes)
- HS512: 512+ bits (64+ bytes)

### 5. Validate Claims

```javascript
jwt.verify(token, secret, {
  algorithms: ['HS256'],
  audience: 'myapp',       // Validate aud claim
  issuer: 'auth-service',  // Validate iss claim
  maxAge: '2h'             // Additional age limit
});
```

### 6. Handle Specific Error Types

```javascript
catch (error) {
  if (error instanceof jwt.TokenExpiredError) {
    return { valid: false, reason: 'expired', expiredAt: error.expiredAt };
  }
  if (error instanceof jwt.NotBeforeError) {
    return { valid: false, reason: 'not-active', date: error.date };
  }
  if (error instanceof jwt.JsonWebTokenError) {
    return { valid: false, reason: 'invalid' };
  }
  throw error; // Unexpected error
}
```

### 7. NEVER Use decode() for Authentication

```javascript
// ✅ ONLY use decode() for debugging
const decoded = jwt.decode(token, { complete: true });
console.log('Token header:', decoded?.header);
console.log('Token payload:', decoded?.payload);
// Do NOT make security decisions based on this\!

// ✅ ALWAYS use verify() for authentication
try {
  const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
  // Now safe to make security decisions
} catch (error) {
  // Invalid token
}
```

## Supported Algorithms

### HMAC (Symmetric - Shared Secret)

- `HS256` - HMAC using SHA-256 (most common for symmetric)
- `HS384` - HMAC using SHA-384
- `HS512` - HMAC using SHA-512

### RSA (Asymmetric - Public/Private Key)

- `RS256` - RSASSA-PKCS1-v1_5 using SHA-256
- `RS384` - RSASSA-PKCS1-v1_5 using SHA-384
- `RS512` - RSASSA-PKCS1-v1_5 using SHA-512

### ECDSA (Asymmetric - Elliptic Curve)

- `ES256` - ECDSA using P-256 and SHA-256
- `ES384` - ECDSA using P-384 and SHA-384
- `ES512` - ECDSA using P-521 and SHA-512

### PSS (Asymmetric - Probabilistic Signature)

- `PS256` - RSASSA-PSS using SHA-256
- `PS384` - RSASSA-PSS using SHA-384
- `PS512` - RSASSA-PSS using SHA-512

### None (DANGEROUS - No Signature)

- `none` - No signature verification

**WARNING:** Never allow `none` algorithm in production\! Always whitelist specific algorithms.

## Minimum Safe Version

**Recommended:** `>=9.0.0`

**Rationale:**
- CVE-2015-9235 fixed in 4.2.2
- CVE-2022-23529 fixed in 9.0.0
- CVE-2022-23540 fixed in 9.0.0
- Modern security improvements in 9.x
- Active maintenance

**Latest Version (2026-02-27):** v9.0.2

## Contract Justification

This contract requires error handling because:

1. **jwt.verify() is a critical security boundary**
   - Throws TokenExpiredError, NotBeforeError, JsonWebTokenError
   - Missing error handling = authentication bypass or crash
   - Security decisions depend on proper error handling

2. **jwt.sign() can throw on invalid inputs**
   - Invalid payload, secret, or options cause errors
   - Missing error handling = crash during login/token generation

3. **Common mistakes are security-critical**
   - Using decode() instead of verify() = complete auth bypass
   - Missing algorithms option = vulnerable to CVE-2015-9235
   - Not checking callback errors = undefined behavior

4. **Error types indicate different security states**
   - TokenExpiredError: Legitimate expiration (refresh needed)
   - JsonWebTokenError: Invalid/tampered token (reject access)
   - NotBeforeError: Token not yet valid (retry later)

The library is designed to fail fast on security violations, making proper error handling essential for both security and reliability.

## Additional Resources

- [OWASP JWT Testing Guide](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/06-Session_Management_Testing/10-Testing_JSON_Web_Tokens)
- [JWT.io - Debugger and Introduction](https://jwt.io/)
- [Auth0: Validate JSON Web Tokens](https://auth0.com/docs/secure/tokens/json-web-tokens/validate-json-web-tokens)
- [PropelAuth: JWT Authentication Explained](https://www.propelauth.com/post/jwts-explained-with-code-examples)
- [Invicti: JWT Attacks and Vulnerabilities](https://www.invicti.com/blog/web-security/json-web-token-jwt-attacks-vulnerabilities/)
