# OpenAI Behavioral Contract - Sources

## Official Documentation

### Error Handling
- **Error Codes Guide**: https://developers.openai.com/api/docs/guides/error-codes/
- **Rate Limits Guide**: https://developers.openai.com/api/docs/guides/rate-limits/
- **Rate Limit Cookbook**: https://cookbook.openai.com/examples/how_to_handle_rate_limits
- **Rate Limit Best Practices**: https://help.openai.com/en/articles/6891753-what-are-the-best-practices-for-managing-my-rate-limits-in-the-api

### API References
- **NPM Package**: https://www.npmjs.com/package/openai
- **GitHub Repository**: https://github.com/openai/openai-node
- **TypeScript API Reference**: https://developers.openai.com/api/reference/typescript/

## Error Types

### 401 - AuthenticationError
**When it occurs**: Invalid, missing, or revoked API key

**Common causes**:
- API key not set in environment
- Using wrong API key (test vs production)
- API key has been revoked
- Account is not part of an organization
- Organization has been deleted

**Handling strategy**:
- DO NOT retry with the same credentials
- Verify API key is correct
- Check organization membership
- Use environment variables for keys
- Never hardcode API keys in code
- Regularly rotate keys for security

**Source**: https://muneebdev.com/openai-401-error-troubleshooting-guide/

### 429 - RateLimitError
**When it occurs**: API rate limit exceeded

**Rate limit types**:
- **RPM** (Requests per minute)
- **RPD** (Requests per day)
- **TPM** (Tokens per minute)
- **TPD** (Tokens per day)
- **IPM** (Images per minute) - for DALL-E

**Response headers**:
- `x-ratelimit-remaining-requests`: Requests left in current window
- `x-ratelimit-remaining-tokens`: Tokens left in current window
- `x-ratelimit-reset-requests`: Time until request limit resets
- `x-ratelimit-reset-tokens`: Time until token limit resets

**Handling strategy**:
- Implement exponential backoff retry logic
- Monitor rate limit headers
- Reduce `max_tokens` to decrease token consumption
- Batch requests where possible
- Implement request queue for sustained traffic
- Contact OpenAI to request limit increases for production

**Automatic Retries**: SDK retries 2 times automatically with exponential backoff

**Sources**:
- [Rate Limits Guide](https://developers.openai.com/api/docs/guides/rate-limits/)
- [Handling 429 Errors](https://help.openai.com/en/articles/5955604-how-can-i-solve-429-too-many-requests-errors)
- [Practical Guide to OpenAI Rate Limits](https://www.eesel.ai/blog/openai-rate-limits)

### 400 - BadRequestError
**When it occurs**: Invalid request parameters

**Common causes**:
- Invalid model name
- Temperature out of range (must be 0-2)
- Invalid message format
- Token limit exceeded for embeddings
- Audio file too large (>25 MB for Whisper)
- Unsupported audio format

**Handling strategy**:
- Validate all parameters before making API call
- Check error.message for specific parameter issue
- DO NOT retry without fixing the problem
- Common fixes: verify model names, validate ranges, check input lengths

**Source**: https://developers.openai.com/api/docs/guides/error-codes/

### 500+ - APIError (Server Errors)
**When it occurs**: Internal OpenAI server error

**Error codes**: 500, 502, 503, 504

**Handling strategy**:
- Treat as transient failure
- Retry with exponential backoff
- SDK automatically retries 2 times
- If persistent, check OpenAI status page
- Log for monitoring - sustained 5xx may indicate outage

**Source**: https://wizardstool.com/openai-api-http-errors-guide/

### Timeout Errors
**When it occurs**: Request exceeds timeout limit (default: 10 minutes)

**Handling strategy**:
- Retry with exponential backoff
- Reduce `max_tokens` to speed up generation
- For streaming, implement client-side timeout handling
- Configure custom timeout: `new OpenAI({ timeout: 20 * 1000 })`

**Source**: https://www.npmjs.com/package/openai

### Content Filter Error
**When it occurs**: Input or output flagged by safety system

**Error code**: `content_filter`

**Handling strategy**:
- DO NOT retry with same content
- Return user-friendly error message
- Consider implementing pre-filtering
- Review OpenAI usage policies
- For images, this may be content policy violation

**Source**: https://developers.openai.com/api/docs/guides/error-codes/

## SDK Features

### Automatic Retries
The OpenAI SDK automatically retries certain errors **2 times by default** with exponential backoff:
- 429 (Rate Limit)
- 408 (Request Timeout)
- 409 (Conflict)
- 500+ (Server Errors)
- Connection errors

**Configuration**:
```typescript
// Global configuration
const openai = new OpenAI({ maxRetries: 5 });

// Per-request configuration
const completion = await openai.chat.completions.create(
  { model: "gpt-4", messages: [...] },
  { maxRetries: 0 } // Disable retries for this request
);
```

**Source**: https://www.npmjs.com/package/openai

### Request Timeout
Default timeout: **10 minutes**

**Configuration**:
```typescript
const openai = new OpenAI({ timeout: 20 * 1000 }); // 20 seconds
```

### TypeScript Support
- TypeScript >= 4.9 supported
- Full type definitions for all API endpoints
- Request params and response fields are fully typed

## Common Production Issues

### Issue 1: Unexpected API Costs
**Severity**: High - Financial impact

**Problem**: Not setting `max_tokens` can result in unexpectedly long (and expensive) completions

**Solution**:
- Always set `max_tokens` explicitly
- Set based on expected response length + buffer
- Monitor token usage via response headers
- Example: For 400-token responses, set `max_tokens` around 500

**Source**: https://developers.openai.com/api/docs/guides/rate-limits/

### Issue 2: Rate Limit Errors During Traffic Spikes
**Severity**: High - Service degradation

**Problem**: Sudden traffic increases hit rate limits, causing 429 errors

**Solutions**:
1. Implement request queue with rate limiting
2. Use exponential backoff (automatic in SDK)
3. Monitor `x-ratelimit-remaining-*` headers
4. Request limit increase from OpenAI for production apps
5. Implement caching for repeated queries

**Sources**:
- [How to Handle Rate Limits](https://cookbook.openai.com/examples/how_to_handle_rate_limits)
- [Rate Limit Best Practices](https://help.openai.com/en/articles/6891753-what-are-the-best-practices-for-managing-my-rate-limits-in-the-api)

### Issue 3: Hardcoded API Keys
**Severity**: Critical - Security risk

**Problem**: API keys committed to version control or hardcoded in source

**Solution**:
- Use environment variables exclusively
- Add `.env` to `.gitignore`
- Rotate keys regularly
- Use different keys for development and production
- Never log API keys in error messages

**Source**: https://muneebdev.com/openai-401-error-troubleshooting-guide/

### Issue 4: Not Handling Token Limits
**Severity**: Medium - Truncated responses

**Problem**: Hitting token limits causes incomplete responses

**Solutions**:
1. For chat: Check `finish_reason` in response
   - `"length"` = hit token limit (response truncated)
   - `"stop"` = normal completion
2. For embeddings: Chunk input text before API call
   - text-embedding-ada-002: 8191 tokens max
3. Estimate token count before making request

**Source**: https://developers.openai.com/api/docs/guides/error-codes/

### Issue 5: Streaming Response Errors
**Severity**: Medium - Incomplete data

**Problem**: Streaming responses can fail mid-stream

**Solution**:
- Implement stream-specific error handling
- Handle connection drops gracefully
- Consider client-side timeout for streams
- Process partial responses when possible

**Source**: https://www.npmjs.com/package/openai

## Security Advisories

**Last Checked**: 2026-02-23

### Notable CVEs

**CVE-2024-27564** - Server-Side Request Forgery (SSRF) in ChatGPT infrastructure
- **Severity**: Medium (but actively exploited)
- **Impact**: Over 10,479 attack attempts recorded
- **Status**: Addressed by OpenAI
- **Source**: [OpenAI Under Attack: CVE-2024-27564](https://securityboulevard.com/2025/03/openai-under-attack-cve-2024-27564-actively-exploited-in-the-wild/)

**CVE-2025-61260** - Codex CLI Command Execution Vulnerability
- **Severity**: High
- **Impact**: Automatically executed commands from project configs without user approval
- **Affected**: Codex CLI tool
- **Status**: Patched (August 2025)
- **Source**: [Vulnerability in OpenAI Coding Agent](https://www.securityweek.com/vulnerability-in-openai-coding-agent-could-facilitate-attacks-on-developers/)

**CVE-2025-53767** - Azure OpenAI SSRF-based Privilege Escalation
- **Severity**: Critical
- **Impact**: Elevation of privilege via SSRF
- **Affected**: Azure OpenAI services
- **Source**: [Azure OpenAI CVE-2025-53767](https://zeropath.com/blog/cve-2025-53767)

### General Security Context
- 12 critical vulnerabilities found in AI model infrastructure (2025)
- Risk of unauthorized access and data theft
- OpenAI launched "Aardvark" security tool to help identify vulnerabilities

**Sources**:
- [15 Vulnerabilities Disclosed in OpenAI Models](https://www.linkedin.com/pulse/15-different-vulnerabilities-disclosed-openai-models-more-tmmkf)
- [Introducing Aardvark](https://openai.com/index/introducing-aardvark/)

## Best Practices Summary

### 1. API Key Management
```typescript
// ✅ CORRECT: Use environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ❌ WRONG: Hardcoded key
const openai = new OpenAI({
  apiKey: "sk-...",
});
```

### 2. Error Handling Pattern
```typescript
import OpenAI from "openai";

const openai = new OpenAI();

try {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: "Hello!" }],
    max_tokens: 500, // Always set explicitly
  });

  // Check if response was truncated
  if (completion.choices[0].finish_reason === "length") {
    console.warn("Response was truncated due to token limit");
  }

} catch (error) {
  if (error instanceof OpenAI.APIError) {
    if (error.status === 401) {
      // Authentication error - don't retry
      console.error("Invalid API key");
    } else if (error.status === 429) {
      // Rate limit - SDK auto-retries, but you may want custom logic
      console.warn("Rate limit hit, SDK will retry");
    } else if (error.status >= 500) {
      // Server error - SDK auto-retries
      console.warn("OpenAI server error, retrying");
    }
  }
  throw error;
}
```

### 3. Rate Limit Monitoring
```typescript
const response = await openai.chat.completions.create({...});

// Monitor rate limits from headers
const headers = response.headers;
console.log("Requests remaining:", headers["x-ratelimit-remaining-requests"]);
console.log("Tokens remaining:", headers["x-ratelimit-remaining-tokens"]);
```

### 4. Configure Retries and Timeouts
```typescript
const openai = new OpenAI({
  maxRetries: 3,           // Increase from default 2
  timeout: 30 * 1000,      // 30 seconds instead of 10 minutes
});
```

## Verification Date
**Last Verified**: 2026-02-23
**OpenAI SDK Version**: 4.x
**Documentation Version**: Current as of February 2026
