# Sources: @sendgrid/mail Behavioral Contract

**Package:** @sendgrid/mail
**Version:** ^7.0.0 || ^8.0.0
**Research Date:** 2026-02-24

---

## Official Documentation

### Error Handling Guide
- **URL:** https://github.com/sendgrid/sendgrid-nodejs/blob/main/docs/use-cases/success-failure-errors.md
- **Key Points:**
  - Promise-based error handling with `.catch()`
  - Callback-based error handling with `(error, result) => {}`
  - Error structure: `error.message`, `error.code`, `error.response.body`
  - Recommends extracting error details before logging

### Troubleshooting Guide
- **URL:** https://github.com/sendgrid/sendgrid-nodejs/blob/main/TROUBLESHOOTING.md
- **Key Points:**
  - API key configuration issues (missing, hardcoded, whitespace)
  - Kubernetes deployment: use `.trim()` on API keys
  - Request validation and debugging techniques
  - Webhook verification patterns

### Rate Limiting Documentation
- **URL:** https://www.twilio.com/docs/sendgrid/api-reference/how-to-use-the-sendgrid-v3-api/rate-limits
- **Key Points:**
  - 429 Too Many Requests when rate limit exceeded
  - X-RateLimit-Reset header indicates retry timing
  - Rate limits vary by account type
  - Implement exponential backoff for retries

### npm Package Page
- **URL:** https://www.npmjs.com/package/@sendgrid/mail
- **Key Points:**
  - Official SendGrid Node.js library
  - Supports send() and sendMultiple() methods
  - Promise-based API
  - Requires API key configuration

---

## GitHub Issues & Community

### Rate Limiting with sendMultiple()
- **URL:** https://github.com/sendgrid/sendgrid-nodejs/issues/1081
- **Issue:** API rate restrictions when sending multiple emails
- **Key Finding:** sendMultiple() calls v3/mail/send endpoint multiple times in parallel
- **Implication:** High risk of hitting rate limits with bulk sending

### Error Code Handling Discussion
- **URL:** https://github.com/sendgrid/sendgrid-nodejs/issues/997
- **Issue:** How to properly handle error codes
- **Key Finding:** Error response structure contains statusCode, body, headers
- **Best Practice:** Check error.response existence before accessing properties

### Sendgrid Errors List
- **URL:** https://github.com/sendgrid/sendgrid-nodejs/issues/851
- **Issue:** Request for comprehensive error list
- **Key Finding:** Errors include 401 (auth), 429 (rate limit), 400 (validation)
- **Implication:** Need to handle multiple error types differently

---

## CVE & Security Analysis

### @sendgrid/mail Package Security
- **URL:** https://security.snyk.io/package/npm/%40sendgrid%2Fmail
- **Finding:** No direct vulnerabilities found in @sendgrid/mail
- **Note:** Dependencies should still be monitored

### CVE-2021-34629 (WordPress Plugin Only)
- **URL:** https://www.cvedetails.com/cve/CVE-2021-34629/
- **Affected:** SendGrid WordPress plugin through version 1.11.8
- **Not Affected:** Node.js @sendgrid/mail package
- **Implication:** Node.js library is not affected by this CVE

---

## Error Patterns & Best Practices

### Common API Errors

**401 Unauthorized**
- Cause: Invalid or missing API key
- Solution: Validate API key exists and is correctly configured
- Prevention: Trim whitespace, check for empty values

**429 Too Many Requests**
- Cause: Rate limit exceeded
- Solution: Implement retry with exponential backoff
- Prevention: Use queuing systems (Bull, AWS SQS) for bulk sends
- Headers: Check X-RateLimit-Reset for retry timing

**400 Bad Request**
- Cause: Invalid email addresses, missing required fields, malformed data
- Solution: Validate email format, ensure from/to/subject exist
- Prevention: Schema validation before sending

**Network Errors**
- Cause: Connection timeout, DNS failures
- Solution: Implement retry logic with timeout configuration
- Prevention: Set reasonable timeout values

---

## Real-World Implementation Patterns

### Recommended Pattern (Async/Await)
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY?.trim() || '');

async function sendEmail() {
  try {
    await sgMail.send({
      to: 'user@example.com',
      from: 'noreply@company.com',
      subject: 'Test Email',
      text: 'Hello World'
    });
    console.log('Email sent successfully');
  } catch (error) {
    // Check for API error response
    if (error.response) {
      console.error('SendGrid API Error:', error.response.body);

      // Handle specific error codes
      if (error.response.statusCode === 429) {
        // Rate limit - implement retry
      } else if (error.response.statusCode === 401) {
        // Invalid API key
      }
    } else {
      // Network error
      console.error('Network Error:', error.message);
    }
    throw error;
  }
}
```

### Recommended Pattern (Promise-Based)
```typescript
sgMail.send(msg)
  .then(() => {
    console.log('Email sent');
  })
  .catch(error => {
    if (error.response) {
      console.error(error.response.body);
    }
    console.error(error);
  });
```

---

## Testing Strategy

### Test Scenarios
1. Valid email send (should succeed)
2. Invalid API key (should throw 401)
3. Invalid email address (should throw 400)
4. Rate limit exceeded (should throw 429)
5. Network timeout (should throw network error)
6. Missing required fields (should throw 400)

### Fixture Coverage
- **proper-error-handling.ts:** Demonstrates correct try-catch with error.response check
- **missing-error-handling.ts:** No try-catch (should trigger violations)
- **generic-catch.ts:** Try-catch without error.response check (should warn)
- **rate-limit-handling.ts:** Demonstrates 429 error handling

---

## References

**Articles & Tutorials:**
- [SendGrid Node.js Integration Guide](https://thenodeway.io/posts/sendgrid-node-js/)
- [How to Send Emails with SendGrid in Node.js](https://coreui.io/answers/how-to-send-emails-with-sendgrid-in-nodejs/)
- [LogRocket: Send Emails with Node.js Using SendGrid](https://blog.logrocket.com/how-to-send-emails-with-node-js-using-sendgrid/)

**Additional Documentation:**
- [Attachments Use Case](https://github.com/sendgrid/sendgrid-nodejs/blob/main/docs/use-cases/attachments.md)
- [Transactional Templates](https://github.com/sendgrid/sendgrid-nodejs/blob/main/docs/use-cases/transactional-templates.md)
- [SendGrid API v3 Reference](https://docs.sendgrid.com/api-reference/mail-send/mail-send)

---

## Research Notes

**Completed:** 2026-02-24
**Researcher:** Claude Sonnet 4.5
**Quality:** High - Official documentation and GitHub issues reviewed
**Coverage:** Comprehensive - All major error scenarios identified
