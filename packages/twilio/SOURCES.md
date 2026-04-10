# Sources: twilio

This document tracks the research sources used to create the behavioral contract for the `twilio` package.

---

## Official Documentation

### Error Handling & Diagnostics
- **URL:** https://www.twilio.com/docs/conversations/error-handling-diagnostics
- **Accessed:** 2026-02-25
- **Key Findings:**
  - Connection state changes must be monitored
  - All async operations return result objects requiring success verification
  - "Denied" state indicates Access Token problems
  - 401 errors indicate permissions issues
  - Enable DEBUG-level logging for diagnostics

### Error and Warning Dictionary
- **URL:** https://www.twilio.com/docs/api/errors
- **Accessed:** 2026-02-25
- **Key Findings:**
  - **10001-19999:** Account and authentication errors
  - **11200-11243:** HTTP and connection errors
  - **12000-14111:** Validation errors
  - **14107:** SMS send rate limit exceeded
  - **20003:** Invalid credentials
  - **20005:** Account suspended
  - **21xxx:** Messaging-specific validation errors
  - Complete JSON error reference available for download

### GitHub Repository
- **URL:** https://github.com/twilio/twilio-node
- **Accessed:** 2026-02-25
- **Key Findings:**
  - Promise-based error handling with `.catch()`
  - Async/await with try-catch support
  - RestException class provides: code, message, status, moreInfo
  - Environment variable pattern for credentials
  - CommonJS and ES6 import patterns supported

### NPM Package
- **URL:** https://www.npmjs.com/package/twilio
- **Accessed:** 2026-02-25
- **Key Findings:**
  - 400/500 level HTTP responses throw errors
  - Both promise and callback-based error handling
  - RestException can be imported for type checking

---

## Error Code Categories

### Authentication Errors
- **20003:** Authenticate (invalid AccountSid or AuthToken)
- **20005:** Account suspended
- **Pattern:** Check these errors early to fail fast

### Rate Limiting Errors
- **14107:** SMS send rate limit exceeded
- **20429:** Too many requests
- **Pattern:** Implement retry logic with exponential backoff

### Validation Errors
- **21211:** Invalid 'To' phone number
- **21212:** Invalid 'From' phone number
- **21408:** Permission to send SMS not enabled
- **21610:** Unsubscribed recipient
- **Pattern:** Validate input before API calls

### HTTP Errors
- **401 Unauthorized:** Authentication failure
- **403 Forbidden:** Permission denied
- **404 Not Found:** Resource doesn't exist
- **503 Service Unavailable:** Twilio service issue
- **Pattern:** Retry with backoff for 503, fail for 401/403

---

## Security Considerations

### Credential Management
- **Risk:** Hardcoded credentials in source code
- **Mitigation:** Always use environment variables
- **Environment Variables:**
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
- **Source:** https://github.com/twilio/twilio-node README

### Webhook Security
- **Risk:** Spoofed webhook requests
- **Mitigation:** Use `twilio.validateRequest()` or `twilio.validateExpressRequest()`
- **Pattern:** Verify `x-twilio-signature` header
- **Source:** Twilio Security Best Practices

---

## Common API Operations

### Sending SMS
```typescript
const message = await client.messages.create({
  body: 'Hello from Twilio',
  to: '+12345678901',
  from: '+10987654321'
});
```

### Making Calls
```typescript
const call = await client.calls.create({
  url: 'http://demo.twilio.com/docs/voice.xml',
  to: '+12345678901',
  from: '+10987654321'
});
```

### Verification (2FA)
```typescript
const verification = await client.verify
  .services(serviceSid)
  .verifications
  .create({ to: '+12345678901', channel: 'sms' });
```

---

## Error Handling Patterns

### Basic Try-Catch
```typescript
try {
  const message = await client.messages.create({...});
} catch (error) {
  console.error('Failed to send message:', error);
  throw error;
}
```

### RestException Check
```typescript
import { RestException } from 'twilio';

try {
  const message = await client.messages.create({...});
} catch (error) {
  if (error instanceof RestException) {
    console.error(`Twilio error ${error.code}: ${error.message}`);
    // Handle specific error codes
    if (error.code === 14107) {
      // Rate limited - retry later
    } else if (error.code === 21211) {
      // Invalid phone number
    }
  }
  throw error;
}
```

### Promise-based
```typescript
client.messages.create({...})
  .then((message) => console.log(message.sid))
  .catch((error) => {
    if (error instanceof RestException) {
      console.error(error.code, error.message);
    }
  });
```

---

## CVE Analysis

**Search Date:** 2026-02-25
**Search Query:** "twilio npm CVE"

**Result:** No critical CVEs found for the `twilio` npm package.

**Main Security Concerns:**
1. Credential exposure (hardcoded tokens)
2. Webhook spoofing (missing signature validation)
3. Rate limiting abuse

**Note:** These are implementation issues, not package vulnerabilities.

---

## Related Resources

### Twilio Changelog
- **URL:** https://www.twilio.com/en-us/changelog/twilio-functions--node-js-v22-becomes-the-default-runtime-on-jun
- **Note:** Node.js v22 becomes default runtime June 11, 2026

### GitHub Issues
- **URL:** https://github.com/twilio/twilio-node/issues
- **Notable Issue:** #949 - Unhandled rejection in SDK when catching exceptions
- **Resolution:** Use try-catch for async operations

---

## Behavioral Contract Rationale

### Why These Functions?

1. **messages.create()** - Most common Twilio operation, high failure rate due to validation
2. **calls.create()** - Voice operations, critical for telephony apps
3. **verify.services.verifications.create()** - 2FA is security-critical
4. **twilio()** - Client initialization, credential management critical
5. **validateRequest()** - Webhook security prevents spoofing attacks

### Why These Postconditions?

1. **missing-error-handling** - Twilio docs emphasize 400-level errors are "normal"
2. **hardcoded-credentials** - Security best practice, prevent credential leaks
3. **missing-rest-exception-check** - Access to error.code enables specific handling
4. **missing-rate-limit-handling** - Free tier has limits, bulk operations need handling
5. **missing-auth-error-handling** - Fail fast on configuration issues
6. **missing-webhook-signature-verification** - Security critical for webhook endpoints

### Severity Justifications

**ERROR-level (5):**
- Missing try-catch on API calls - Can cause unhandled promise rejections
- Hardcoded credentials - Security vulnerability
- Missing webhook verification - Security vulnerability

**WARNING-level (3):**
- Missing RestException check - Reduces error handling quality
- Missing rate limit handling - Can cause service degradation
- Missing auth error handling - Reduces debuggability

---

## Contract Testing

### Test Fixtures
- `proper-error-handling.ts` - Demonstrates correct patterns
- `missing-error-handling.ts` - Demonstrates violations
- `instance-usage.ts` - Tests client instance detection

### Expected Results
- Proper handling: 0 violations
- Missing handling: 5+ violations
- Instance usage: Correct detection of client.messages.create() patterns

---

## Maintenance Notes

**Last Updated:** 2026-02-25
**Reviewed By:** Claude Sonnet 4.5
**Contract Version:** 1.0.0

**Next Review:** When major Twilio SDK version is released or error handling patterns change.
