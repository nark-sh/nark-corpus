# Sources: validator

## Official Documentation
- npm: https://www.npmjs.com/package/validator
- GitHub: https://github.com/validatorjs/validator.js
- express-validator: https://express-validator.github.io/docs/
- TypeScript definitions: https://www.jsdocs.io/package/@types/validator

## Behavioral Evidence

### Core Behavior: No Throwing
The validator library returns boolean values (true/false) for validators and does NOT throw exceptions on invalid input. However, it throws TypeError if non-string input is provided without explicit handling.

**Key Functions:**
- **Validators** (is* functions): Return boolean, never throw on validation failure
  - isEmail(), isURL(), isIP(), isFQDN(), isMobilePhone()
  - isAlpha(), isNumeric(), isAlphanumeric(), isHexadecimal()
  - isDate(), isJSON(), isJWT(), isUUID()

- **Sanitizers** (to* functions): Return converted value or special failure value
  - toDate() - Returns null on failure
  - toInt() - Returns NaN on failure
  - toFloat() - Returns NaN on failure
  - escape() - Never fails, always returns string
  - unescape() - Never fails, always returns string
  - normalizeEmail() - Returns false if invalid email

### Security Implications

**WARNING Severity Rationale:**
While validator doesn't throw exceptions, FAILING TO VALIDATE allows dangerous input to pass through, leading to:
- **XSS attacks** (unescaped user input in HTML)
- **SQL injection** (unvalidated input in queries)
- **Open redirects** (unvalidated URLs)
- **Email spoofing** (unnormalized emails)

**Critical Security Functions:**
- escape() - Prevents XSS by escaping HTML entities (<, >, &, ', ", /)
- normalizeEmail() - Canonicalizes emails to prevent spoofing
- isURL() - Validates URLs to prevent open redirects (but see CVE-2025-56200)

### Known Vulnerabilities (CVEs)

**CVE-2025-56200** - URL Validation Bypass (Severity: Moderate 6.1)
- Affected: validator < 13.15.20
- Issue: isURL() uses '://' as protocol delimiter, browsers use ':'
- Impact: XSS and open redirect bypasses
- Fixed: 13.15.20 (Sept 2025)
- Reference: https://github.com/advisories/GHSA-9965-vmph-33xx

**CVE-2021-3765** - ReDoS in rtrim/trim sanitizers (Severity: High 7.5)
- Affected: validator < 13.7.0
- Issue: Inefficient regex causes denial of service
- Impact: CPU exhaustion on malicious input
- Fixed: 13.7.0
- Reference: https://github.com/validatorjs/validator.js/security/advisories/GHSA-xx4c-jj58-r7x6

**Historical ReDoS Vulnerabilities:**
- URL validation ReDoS (< 3.22.1) - "Catastrophic backtracking" with 65K+ regex steps
- Data URI ReDoS (< 9.4.1) - 70K character inputs cause 10s processing delays
- Base64 buffer overflow (< 5.0.0) - Regex flaws in isBase64()

**Historical XSS Vulnerabilities:**
- Unescaped backticks in IE9 (< 3.34.0)
- Hex-encoded character bypass in xss() filter (< 2.0.0)
- Nested tag bypasses (< 1.1.1)

### Real-World Usage Patterns

**Common Integration: express-validator**
Most production usage wraps validator.js via express-validator middleware:
```javascript
const { body, validationResult } = require('express-validator');

app.post('/user', [
  body('email').isEmail().normalizeEmail(),
  body('url').isURL()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
});
```

**Typical Error Handling:**
Developers wrap validators to throw errors:
```javascript
if (!validator.isEmail(email)) {
  throw new Error('Invalid email address!');
}
```

**Security Best Practice:**
Always combine validators with sanitizers:
```javascript
const cleanEmail = validator.normalizeEmail(validator.trim(email));
if (!validator.isEmail(cleanEmail)) {
  return res.status(400).send('Invalid email');
}
const safeEmail = validator.escape(cleanEmail); // Prevent XSS
```

## Research References
- Snyk Vulnerability Database: https://snyk.io/node-js/validator
- CVE Details: https://www.cvedetails.com/cve/CVE-2021-3765/
- express-validator examples: https://github.com/jayeshchoudhary/express-validator-example
- Auth0 Tutorial: https://auth0.com/blog/express-validator-tutorial/

## Research Date
2026-02-26
