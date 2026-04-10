# Sources for @slack/web-api Behavioral Contract

**Package:** @slack/web-api
**Version:** 7.x (latest as of 2026-02-25)
**Contract Version:** 1.0.0
**Research Date:** 2026-02-25

---

## Overview

The `@slack/web-api` package is the official Slack Web API client for Node.js. It provides a convenient interface for calling Slack Web API methods, with built-in retry logic, rate limit handling, and error typing.

**Key Behavioral Characteristics:**
- All API methods are async and return `Promise<WebAPICallResult>`
- HTTP 200 is returned even for API-level errors (must check `response.ok`)
- Built-in retry logic: Up to 10 retries over ~30 minutes with exponential backoff
- Three main error types: `RequestError`, `RateLimitedError`, `HTTPError`

---

## Primary Sources

### Official Slack Documentation

1. **Web API Overview**
   - URL: https://docs.slack.dev/tools/node-slack-sdk/web-api/
   - Content: Main documentation for the Node.js SDK
   - Used for: Understanding API structure and usage patterns

2. **Error Handling Documentation**
   - URL: https://tessl.io/registry/tessl/npm-slack--web-api/7.10.0/files/docs/error-handling.md
   - Content: Detailed error types and handling patterns
   - Used for: Error type definitions, retry behavior, error handling best practices

3. **Rate Limits**
   - URL: https://docs.slack.dev/apis/web-api/rate-limits/
   - URL: https://medium.com/slack-developer-blog/handling-rate-limits-with-slacks-apis-f6f8a63bdbdc
   - Content: Rate limiting behavior, 429 responses, Retry-After headers
   - Used for: Understanding rate limit errors and mitigation strategies

4. **Security Best Practices**
   - URL: https://docs.slack.dev/security/
   - URL: https://api.slack.com/authentication/best-practices
   - Content: Token security, secret management, error handling security
   - Used for: Token leakage prevention recommendations

### API Method Documentation

5. **chat.postMessage**
   - URL: https://docs.slack.dev/reference/methods/chat.postMessage/
   - URL: https://api.slack.com/methods/chat.postMessage
   - Content: Method signature, error codes, required scopes
   - Used for: Preconditions, error scenarios, permission requirements

6. **users.list**
   - URL: https://api.slack.com/methods/users.list
   - Content: Method signature, required scopes, error codes
   - Used for: Permission requirements, error scenarios

7. **users.info**
   - URL: https://api.slack.com/methods/users.info
   - Content: Method signature, error codes
   - Used for: Error scenarios, validation requirements

8. **conversations.*** methods
   - URL: https://api.slack.com/methods/conversations.list
   - URL: https://api.slack.com/methods/conversations.join
   - URL: https://api.slack.com/methods/conversations.invite
   - Content: Method signatures, error codes, permission requirements
   - Used for: Channel operation error scenarios

9. **files.upload**
   - URL: https://api.slack.com/methods/files.upload
   - Content: Method signature, file size limits, error codes
   - Used for: File upload constraints and error scenarios

10. **auth.test**
    - URL: https://api.slack.com/methods/auth.test
    - Content: Token validation method
    - Used for: Authentication validation patterns

### Security Research

11. **Token Leakage Remediation**
    - URL: https://www.gitguardian.com/remediation/slack-app-api-token
    - Content: Risks and remediation for leaked Slack tokens
    - Used for: Security considerations in contract

12. **Common Slack API Errors**
    - URL: https://github.com/slackapi/node-slack-sdk/issues/1646
    - URL: https://github.com/beginner-corp/slack/issues/105
    - Content: Real-world error handling issues and discussions
    - Used for: Understanding common developer pitfalls

### Troubleshooting Resources

13. **channel_not_found Troubleshooting**
    - URL: https://knock.app/blog/troubleshooting-channel-not-found-in-slack-incoming-webhooks
    - Content: Common causes of channel_not_found errors
    - Used for: Preconditions for channel-based operations

---

## Real-World Usage Analysis

### Repos Examined

1. **trigger.dev** (Multiple packages)
   - File: `apps/webapp/app/services/slack.server.ts`
   - Pattern: ✅ Proper error handling with try-catch
   - File: `references/d3-chat/src/lib/slack.ts`
   - Pattern: ❌ Missing error handling on chat.postMessage
   - Observation: Inconsistent error handling across codebase

2. **payload** (GitHub Actions)
   - File: `.github/actions/activity/src/new-issues.ts`
   - Pattern: ✅ Proper error handling with try-catch
   - Pattern: ✅ Token validation before use
   - Observation: Good error handling practices

3. **backstage** (notifications plugin)
   - File: `plugins/notifications-backend-module-slack/src/lib/SlackNotificationProcessor.ts`
   - Pattern: 🌟 Advanced error handling with Promise.allSettled, throttling, metrics
   - Pattern: ✅ Try-catch around channel lookup operations
   - Observation: Production-grade error handling implementation

---

## Error Types and HTTP Status Codes

### Error Types (from @slack/web-api)

1. **RequestError**
   - Trigger: Network connection failures, api.slack.com unreachable
   - Properties: `error.original` contains underlying error
   - Handling: Retry with backoff or fail gracefully

2. **RateLimitedError**
   - Trigger: HTTP 429 (Too Many Requests)
   - Properties: `error.retryAfter` (seconds to wait)
   - Handling: Wait `retryAfter` seconds before retry (automatic in WebClient)

3. **HTTPError**
   - Trigger: Unexpected HTTP status codes
   - Properties: `statusCode`, `statusMessage`, `headers`, `body`
   - Handling: Log and investigate unexpected responses

### HTTP Status Codes

- **200 OK**: Success OR API-level error (check `response.ok`)
- **429 Too Many Requests**: Rate limiting (check `Retry-After` header)
- **401 Unauthorized**: Invalid/expired/revoked token
- **403 Forbidden**: Missing OAuth scope/permissions

### API-Level Error Codes (in response body when `ok: false`)

- **invalid_auth**: Token is invalid, expired, or revoked
- **token_revoked**: Token has been explicitly revoked
- **account_inactive**: Slack account is inactive
- **not_authed**: No authentication token provided
- **channel_not_found**: Invalid channel ID or bot not a member
- **user_not_found**: Invalid user ID
- **no_permission**: Token lacks required OAuth scope
- **rate_limited**: Rate limit exceeded (alternative to HTTP 429)
- **is_archived**: Channel is archived
- **file_too_large**: File exceeds size limits

---

## Built-in Retry Behavior

The `WebClient` includes automatic retry logic:

- **Max Retries**: 10 attempts
- **Duration**: Spaced over ~30 minutes
- **Backoff**: Exponential backoff algorithm
- **Triggers**: Automatically retries on:
  - Rate limiting (429 / RateLimitedError)
  - Server errors (5xx status codes)
- **Configuration**: Can be disabled or customized via `retryConfig`

**Source**: https://tessl.io/registry/tessl/npm-slack--web-api/7.10.0/files/docs/error-handling.md

---

## Security Considerations

### Token Leakage

**Risk**: Slack tokens leaked in:
- Public GitHub repositories (hardcoded)
- Error messages/logs (echoed back)
- Non-secure storage

**Impact**:
- Unauthorized access to Slack workspace
- Data breaches of user data and messages
- Potential for malicious message posting

**Mitigation**:
- Store tokens in environment variables or secret managers
- Never hardcode tokens in source code
- Avoid echoing tokens in error messages
- Use generic error messages for users

**Sources**:
- https://www.gitguardian.com/remediation/slack-app-api-token
- https://docs.slack.dev/security/

---

## CVE Analysis

**Status**: No known CVEs for `@slack/web-api` package as of 2026-02-25

**Checked**:
- Snyk vulnerability database: https://security.snyk.io/package/npm/@slack%2Fweb-api
- npm audit: No Slack-related findings
- CVE Details: No direct vulnerabilities

**Note**: This does not include transitive dependencies. Regular security scanning recommended.

---

## Contract Design Rationale

### Covered Methods

We selected 8 core methods based on:
1. **Usage frequency**: Most commonly used in real-world codebases
2. **Error-prone**: High likelihood of missing error handling
3. **Impact**: Failure modes affect core functionality

**Methods**:
- `chat.postMessage()` - Most common, high impact
- `users.list()`, `users.info()` - User management operations
- `conversations.list()`, `conversations.join()`, `conversations.invite()` - Channel operations
- `files.upload()` - File operations
- `auth.test()` - Token validation

### Severity Levels

- **ERROR**: Missing try-catch on async API calls
  - Rationale: Can crash application, violates async error handling principles
  - Impact: Production incidents, uncaught promise rejections

- **WARNING**: Not checking `response.ok` field
  - Rationale: API returns 200 even for errors, must check response body
  - Impact: Silent failures, incorrect assumptions about success

### Not Covered

**Why not `chat.update()`, `chat.delete()`?**
- Less commonly used than `postMessage()`
- Same error patterns as covered methods
- Can be added in future contract versions

**Why not Real-Time Messaging API?**
- Different package (`@slack/rtm-api`)
- WebSocket-based, not HTTP-based
- Requires separate contract

---

## Testing Strategy

### Fixtures Created

1. **proper-error-handling.ts**: Demonstrates correct patterns
   - Try-catch around all async calls
   - Checks `response.ok` field
   - Handles rate limiting with `retryAfter`
   - Expected: 0 violations

2. **missing-error-handling.ts**: Demonstrates violations
   - No try-catch on async calls
   - Does not check `response.ok`
   - Expected: Multiple ERROR violations

3. **instance-usage.ts**: Tests detection via instances
   - WebClient instance stored in variable
   - Methods called via instance
   - Expected: Violations detected on instance methods

### Real-World Validation

**Repos to Test**:
- trigger.dev (known to have both good and bad patterns)
- payload (known to have proper error handling)
- backstage (advanced error handling)

**Expected Results**:
- True Positives: Missing try-catch in trigger.dev/d3-chat
- True Negatives: Proper handling in payload, trigger.dev/webapp

---

## Version History

### Version 1.0.0 (2026-02-25)
- Initial contract covering 8 core methods
- ERROR severity for missing try-catch
- WARNING severity for not checking response.ok
- Based on @slack/web-api 7.x documentation

---

## Future Enhancements

1. **Additional Methods**: Add coverage for `chat.update()`, `chat.delete()`, `reactions.*`
2. **Response Validation**: Detect missing pagination handling for list methods
3. **Scope Validation**: Check if token has required OAuth scopes before call
4. **Token Leakage**: Detect if tokens are logged or echoed in errors
5. **Rate Limit Prevention**: Detect missing backoff strategies in high-volume scenarios

---

## Contributors

- Claude Sonnet 4.5 (Initial research and contract design)
- Research Date: 2026-02-25
- Contract Version: 1.0.0
